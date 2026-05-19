"""Upload service — async wrappers around upload_utils (removed zxl_upload)."""

import asyncio
from typing import Optional
from server.upload_utils import upload_file_to_oss, compress_and_upload_folder

async def upload_file_async(file_path: str, target_path: Optional[str] = None) -> Optional[str]:
    """Upload a single file via OSS."""
    return await asyncio.to_thread(upload_file_to_oss, file_path, max_retries=5, target_path=target_path)

async def upload_folder_async(folder_path: str, target_path: Optional[str] = None) -> bool:
    """Upload a folder."""
    result = await asyncio.to_thread(compress_and_upload_folder, folder_path, max_retries=5, target_path=target_path)
    return result is not None
