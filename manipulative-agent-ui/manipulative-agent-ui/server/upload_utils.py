"""
有一张图片，然后上传到oss服务器，返回一个url链接
"""


import hashlib

import requests
import subprocess
import logging
import time
from pathlib import Path
from typing import Optional
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def _extract_index_url(payload: dict) -> Optional[str]:
    """Normalize upload API JSON: different endpoints may use indexUrl / url / fileUrl."""
    if not isinstance(payload, dict):
        return None
    data = payload.get("data")
    if data is None:
        return None
    if not isinstance(data, dict):
        return None
    for key in ("indexUrl", "url", "fileUrl", "cdnUrl", "resourceUrl"):
        val = data.get(key)
        if isinstance(val, str) and val.strip().startswith(("http://", "https://")):
            return val.strip()
    return None


def _upload_json_indicates_failure(payload: dict) -> bool:
    """True when API returns HTTP 200 but JSON reports error (e.g. token 为空) with no URL."""
    if not isinstance(payload, dict):
        return False
    code = payload.get("code")
    if code in (None, 0, "0"):
        return False
    return _extract_index_url(payload) is None


def compress_and_upload_file(
    file_path: str,
    api_token: str = "67667eda7d2d4defdf7f9c98a2c974c2",
    max_retries: int = 5,
    retry_delay: float = 1,
    target_path: Optional[str] = None,
    request_timeout: int = 300,
) -> Optional[str]:
    """
    Upload a single file by staging it as a tiny folder project with index.html.
    """
    source = Path(file_path)
    if not source.exists() or not source.is_file():
        logger.error(f"待上传文件不存在: {file_path}")
        return None

    source_key = hashlib.sha1(str(source.resolve()).encode("utf-8", errors="ignore")).hexdigest()[:12]
    staging_dir = source.parent / f"upload_bundle_{source_key}"
    index_path = staging_dir / "index.html"
    meta_path = staging_dir / "upload_manifest.txt"

    try:
        staging_dir.mkdir(parents=True, exist_ok=True)
        index_path.write_text(
            source.read_text(encoding="utf-8", errors="replace"),
            encoding="utf-8",
        )
        meta_path.write_text(
            f"source={source.name}\ncreated_by=compress_and_upload_file\n",
            encoding="utf-8",
        )
    except Exception as exc:
        logger.error(f"准备上传目录失败: {exc}")
        return None

    url = compress_and_upload_folder(
        str(staging_dir),
        api_token=api_token,
        max_retries=max_retries,
        retry_delay=retry_delay,
        target_path=target_path,
        request_timeout=request_timeout,
    )

    try:
        if index_path.exists():
            index_path.unlink()
        if meta_path.exists():
            meta_path.unlink()
        if staging_dir.exists() and not any(staging_dir.iterdir()):
            staging_dir.rmdir()
    except Exception:
        pass

    return url


def compress_and_upload_folder(
    folder_path: str,
    zip_output_path: Optional[str] = None,
    api_token: str = "67667eda7d2d4defdf7f9c98a2c974c2",
    max_retries: int = 5,
    retry_delay: float = 1,
    target_path: Optional[str] = None,
    request_timeout: int = 300,
) -> Optional[str]:
    """
    压缩文件夹并上传到AIGC API，返回URL，支持重试机制

    Args:
        folder_path (str): 要压缩的文件夹路径
        zip_output_path (Optional[str]): ZIP文件保存路径，如果为None则默认保存到输入文件夹的上一级目录下的zip文件夹中
        api_token (str): API令牌，默认为预设值
        max_retries (int): 最大重试次数，默认为3次
        retry_delay (float): 重试间隔时间（秒），默认为2秒

    Returns:
        Optional[str]: 上传成功返回URL，失败返回None
    """
    folder_path_obj = Path(folder_path)

    if not folder_path_obj.exists() or not folder_path_obj.is_dir():
        logger.error(f"输入文件夹不存在或不是目录: {folder_path}")
        return None

    # Trick: If folder only has index.html, add a dummy file to ensure server processes it like a multi-file project
    # This mimics Project 38 structure which worked (had js files)
    dummy_file = folder_path_obj / "server_fix_dummy.txt"
    created_dummy = False
    if not dummy_file.exists():
        # Check if only index.html exists
        visible_files = [f for f in folder_path_obj.iterdir() if f.is_file() and not f.name.startswith('.')]
        if len(visible_files) <= 1:
            try:
                with open(dummy_file, "w") as f:
                    f.write("fix_single_file_upload_issue")
                created_dummy = True
                logger.info(f"创建临时文件以规避服务器单文件bug: {dummy_file}")
            except Exception:
                pass

    # 确定ZIP输出路径
    if zip_output_path is None:
        # 默认保存到输入文件夹的上一层新建一个zip文件夹
        parent_dir = folder_path_obj.parent
        zip_dir = parent_dir / "zip"
        zip_dir.mkdir(parents=True, exist_ok=True)
        zip_path = zip_dir / f"{folder_path_obj.name}.zip"
    else:
        zip_path = Path(zip_output_path)
        zip_path.parent.mkdir(parents=True, exist_ok=True)

    # 压缩文件夹（使用 Python 的 shutil.make_archive 以保证跨平台兼容）
    try:
        logger.info(f"正在压缩文件夹: {folder_path_obj} -> {zip_path}")
        import shutil

        # 如果zip文件已存在，先删除它以确保重新打包
        if zip_path.exists():
            zip_path.unlink()
            logger.info(f"删除已存在的zip文件: {zip_path}")

        # shutil.make_archive expects the base_name without extension
        base_name = str(zip_path.with_suffix("").resolve())
        # Revert to original nested structure: root_dir is parent, base_dir is folder name
        # This matches the structure of Project 38 which uploaded successfully
        archive_path = shutil.make_archive(base_name, 'zip', root_dir=str(folder_path_obj.parent), base_dir=folder_path_obj.name)
        
        # Clean up dummy file
        if created_dummy and dummy_file.exists():
            dummy_file.unlink()

        # make_archive returns the path to the created archive
        if archive_path and Path(archive_path).exists():
            logger.info(f"压缩成功: {archive_path}")
            zip_path = Path(archive_path)
        else:
            logger.error(f"压缩失败: 未生成归档文件 {archive_path}")
            return None

    except Exception as e:
        if created_dummy and dummy_file.exists():
            dummy_file.unlink()
        logger.error(f"压缩过程中出错: {e}")
        return None

    # 上传文件到AIGC API（支持重试）
    upload_url = "https://atms-api-test.100tal.com/aigc/api/third/resource/upload"
    headers = {"token": api_token}

    for attempt in range(max_retries):
        try:
            logger.info(f"正在上传文件: {zip_path} (尝试 {attempt + 1}/{max_retries})")
            # 确保路径规范化并存在（有时路径中包含混合的斜杠）
            def _find_existing_path(p):
                # 尝试若干常见的路径规范化策略，返回第一个存在的路径字符串
                candidates = [str(p), str(p).replace('\\', '/'), str(p).replace('/', '\\')]
                try:
                    candidates.append(os.path.normpath(str(p)))
                except Exception:
                    pass
                try:
                    candidates.append(os.path.abspath(str(p)))
                except Exception:
                    pass
                seen = set()
                for c in candidates:
                    if c in seen:
                        continue
                    seen.add(c)
                    try:
                        if Path(c).exists():
                            return c
                    except Exception:
                        continue
                return None

            real_zip = _find_existing_path(zip_path)
            if not real_zip:
                logger.error(f"压缩文件不存在，尝试的候选路径: {zip_path}")
                if attempt < max_retries - 1:
                    logger.info(f"将在 {retry_delay} 秒后重试...")
                    time.sleep(retry_delay)
                    continue
                else:
                    logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                    return None

            with open(real_zip, "rb") as file:
                files = {"file": file}
                # 如果提供 target_path，则作为表单字段发送（有些后端使用此字段来放置目标路径）
                post_kwargs = {"headers": headers, "files": files, "timeout": request_timeout}
                if target_path:
                    post_kwargs["data"] = {"target_path": target_path}
                response = requests.post(upload_url, **post_kwargs)

                logger.info(f"API响应状态码: {response.status_code}")
                # logger.info(f"API响应内容: {response.text[:500]}...")  # 只显示前500字符

                if response.status_code == 200:
                    try:
                        result = response.json()
                        if _upload_json_indicates_failure(result):
                            logger.error(
                                "上传接口业务失败 "
                                f"code={result.get('code')} message={result.get('message')} "
                                "(例如 token 为空：请配置 run_pipeline.upload.api_token "
                                "或环境变量 ANIMATION_UPLOAD_API_TOKEN / PIPELINE_UPLOAD_TOKEN)"
                            )
                            return None
                        url = _extract_index_url(result)
                        if url:
                            # 强制追加 index.html 如果原链接没有且文件夹包含它
                            # This is a safe fallback even if server is fixed by dummy file
                            if not url.endswith('/index.html') and not url.endswith('.html'):
                                if (folder_path_obj / 'index.html').exists():
                                    if not url.endswith('/'):
                                        url += '/'
                                    url += 'index.html'
                            
                            logger.info(f"上传成功: {url}")
                            return url
                        else:
                            logger.error(
                                f"上传失败，响应中未找到URL。完整响应: {result}"
                            )
                            if attempt < max_retries - 1:
                                logger.info(f"将在 {retry_delay} 秒后重试...")
                                time.sleep(retry_delay)
                                continue
                            else:
                                logger.error(
                                    f"达到最大重试次数 {max_retries}，上传失败"
                                )
                                return None
                    except ValueError as e:
                        logger.error(f"解析API响应失败: {e}")
                        logger.error(f"原始响应内容: {response.text}")
                        if attempt < max_retries - 1:
                            logger.info(f"将在 {retry_delay} 秒后重试...")
                            time.sleep(retry_delay)
                            continue
                        else:
                            logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                            return None
                else:
                    error_msg = f"上传失败，状态码: {response.status_code}, 响应: {response.text}"
                    logger.error(error_msg)
                    if attempt < max_retries - 1:
                        logger.info(f"将在 {retry_delay} 秒后重试...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                        return None

        except requests.exceptions.RequestException as e:
            logger.error(f"网络请求异常: {e}")
            if attempt < max_retries - 1:
                logger.info(f"将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
                continue
            else:
                logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                return None
        except Exception as e:
            logger.error(f"上传过程中发生未知错误: {e}")
            if attempt < max_retries - 1:
                logger.info(f"将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
                continue
            else:
                logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                return None

    # 所有重试都失败
    logger.error(f"文件夹 {folder_path} 上传失败，已尝试 {max_retries} 次")
    return None


def upload_file_to_oss(
    file_path,
    api_token: str = "67667eda7d2d4defdf7f9c98a2c974c2",
    max_retries=5,
    retry_delay=1,
    target_path: Optional[str] = None,
    request_timeout: int = 180,
):
    """
    上传单个文件到OSS，返回URL，支持重试机制

    Args:
        file_path (str): 要上传的文件路径
        max_retries (int): 最大重试次数，默认为3次
        retry_delay (float): 重试间隔时间（秒），默认为2秒

    Returns:
        str: 上传成功返回URL，失败返回None
    """
    url = "https://atms-api-test.100tal.com/aigc/api/third/resource/upload"
    headers = {"token": api_token}

    for attempt in range(max_retries):
        try:
            logger.info(f"正在上传文件: {file_path} (尝试 {attempt + 1}/{max_retries})")

            # 尝试规范化并查找真实存在的文件路径，处理混合斜杠问题
            def _find_existing_path(p):
                candidates = [str(p), str(p).replace('\\', '/'), str(p).replace('/', '\\')]
                try:
                    candidates.append(os.path.normpath(str(p)))
                except Exception:
                    pass
                try:
                    candidates.append(os.path.abspath(str(p)))
                except Exception:
                    pass
                seen = set()
                for c in candidates:
                    if c in seen:
                        continue
                    seen.add(c)
                    try:
                        if Path(c).exists():
                            return c
                    except Exception:
                        continue
                return None

            real_path = _find_existing_path(file_path)
            if not real_path:
                path_candidates = [
                    file_path,
                    file_path.replace("\\", "/"),
                    file_path.replace("/", "\\"),
                    os.path.normpath(file_path),
                    os.path.abspath(file_path),
                ]
                logger.error(f"上传文件时未找到文件: {file_path}. 尝试了候选路径: {path_candidates}")
                if attempt < max_retries - 1:
                    logger.info(f"将在 {retry_delay} 秒后重试...")
                    time.sleep(retry_delay)
                    continue
                else:
                    logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                    return None

            logger.info(f"使用实际文件路径: {real_path}")

            with open(real_path, "rb") as file:
                files = {"file": file}
                post_kwargs = {"headers": headers, "files": files, "timeout": request_timeout}
                if target_path:
                    post_kwargs["data"] = {"target_path": target_path}
                response = requests.post(url, **post_kwargs)

                logger.info(f"API响应状态码: {response.status_code}")
                logger.info(f"API响应内容: {response.text[:500]}...")  # 只显示前500字符

                if response.status_code == 200:
                    try:
                        result = response.json()
                        if _upload_json_indicates_failure(result):
                            logger.error(
                                "上传接口业务失败 "
                                f"code={result.get('code')} message={result.get('message')} "
                                "(例如 token 为空：请配置 run_pipeline.upload.api_token "
                                "或环境变量 ANIMATION_UPLOAD_API_TOKEN / PIPELINE_UPLOAD_TOKEN)"
                            )
                            return None
                        url_result = _extract_index_url(result)
                        if url_result:
                            logger.info(f"上传成功: {url_result}")
                            return url_result
                        logger.error(f"响应中未解析到 URL。完整响应: {response.text}")
                    except (KeyError, TypeError, ValueError) as e:
                        logger.error(f"解析响应失败: {e}")
                        logger.error(f"完整响应: {response.text}")
                    if attempt < max_retries - 1:
                        logger.info(f"将在 {retry_delay} 秒后重试...")
                        time.sleep(retry_delay)
                        continue
                    logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                    return None
                else:
                    error_msg = f"上传失败，状态码: {response.status_code}, 响应: {response.text}"
                    logger.error(error_msg)
                    if attempt < max_retries - 1:
                        logger.info(f"将在 {retry_delay} 秒后重试...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                        return None

        except requests.exceptions.RequestException as e:
            logger.error(f"网络请求异常: {e}")
            if attempt < max_retries - 1:
                logger.info(f"将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
                continue
            else:
                logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                return None
        except Exception as e:
            logger.error(f"上传过程中发生未知错误: {e}")
            if attempt < max_retries - 1:
                logger.info(f"将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
                continue
            else:
                logger.error(f"达到最大重试次数 {max_retries}，上传失败")
                return None

    # 所有重试都失败
    logger.error(f"文件 {file_path} 上传失败，已尝试 {max_retries} 次")
    return None


if __name__ == "__main__":
    # 示例用法：传入相对当前工作目录的待上传文件夹。
    test_folder = "upload_package"

    url = compress_and_upload_folder(test_folder)
    if url:
        print(f"上传成功，URL: {url}")
    else:
        print("上传失败")
