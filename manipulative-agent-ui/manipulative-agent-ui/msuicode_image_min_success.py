r"""Minimal *working* image generation call for msuicode (chat/completions).

This is a distilled version of the successful path you confirmed:
- POST https://www.msuicode.com/v1/chat/completions
- Use Authorization: Bearer <api_key>
- Send a multimodal-style message content: text + (optional) image_url
- Extract returned base64 image(s) from the response and save to disk

PowerShell:
  python .\20260307\msuicode_image_min_success.py

Notes:
- This script intentionally does NOT read any external configs.
- Do not commit real API keys.
"""

from __future__ import annotations

import base64
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List

import requests


def _bearer_headers(api_key: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _save_b64_png(b64_str: str, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(base64.b64decode(b64_str))


def save_images_from_chat_response(resp: Dict[str, Any], out_dir: str, name: str) -> List[str]:
    """Extract images from common gateway response shapes and save them."""

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    saved: List[str] = []
    choices = resp.get("choices") or []

    for ci, choice in enumerate(choices):
        msg = (choice or {}).get("message") or {}

        # Shape A: message.images = [ { image_url: { url: 'data:image/png;base64,...' } } ]
        images = msg.get("images") or []
        if isinstance(images, list):
            for ii, img in enumerate(images):
                if not isinstance(img, dict):
                    continue
                url = None
                if isinstance(img.get("image_url"), dict):
                    url = img.get("image_url", {}).get("url")
                if not url:
                    url = img.get("url")
                if isinstance(url, str) and url.startswith("data:image"):
                    b64 = url.split(",", 1)[-1]
                    p = out / f"{name}_{ci}_{ii}.png"
                    _save_b64_png(b64, p)
                    saved.append(str(p))

        # Shape B: message.content is list[dict] with image_url
        content = msg.get("content")
        if isinstance(content, list):
            for cj, item in enumerate(content):
                if not isinstance(item, dict):
                    continue
                url = None
                if isinstance(item.get("image_url"), dict):
                    url = item.get("image_url", {}).get("url")
                if not url:
                    url = item.get("url") or item.get("data") or item.get("image")
                if isinstance(url, str) and url.startswith("data:image"):
                    b64 = url.split(",", 1)[-1]
                    p = out / f"{name}_{ci}_{cj}.png"
                    _save_b64_png(b64, p)
                    saved.append(str(p))

        # Shape C: message.content is string embedding data:image...
        if isinstance(content, str) and "data:image" in content:
            data_url = content[content.find("data:image") :]
            b64 = data_url.split(",", 1)[-1]
            p = out / f"{name}_{ci}.png"
            _save_b64_png(b64, p)
            saved.append(str(p))

    return saved


def generate_image_via_chat(
    *,
    base_url: str,
    api_key: str,
    model: str,
    prompt: str,
    timeout_sec: int = 120,
) -> Dict[str, Any]:
    url = base_url.rstrip("/") + "/v1/chat/completions"

    message_content: List[Any] = [{"type": "text", "text": prompt}]

    payload: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": message_content}],
        # Keep the same default as your working code
        "modalities": ["text", "image"],
    }

    print("request url:", url)

    # Some Windows networks / proxies may intermittently break TLS handshakes.
    # We'll retry a couple times with short backoff to reduce flakiness.
    last_exc: Exception | None = None
    for attempt in range(1, 4):
        try:
            t0 = time.time()
            r = requests.post(url, headers=_bearer_headers(api_key), json=payload, timeout=timeout_sec)
            dt = time.time() - t0

            print(f"attempt {attempt}/3 -> status: {r.status_code} time_sec: {dt:.3f}")
            r.raise_for_status()
            return r.json()

        except requests.exceptions.SSLError as e:
            last_exc = e
            print(f"SSL error on attempt {attempt}/3: {e}")
            if attempt < 3:
                time.sleep(0.8 * attempt)
                continue
            raise

        except requests.RequestException as e:
            # Includes timeouts, connection resets, etc.
            last_exc = e
            print(f"Request error on attempt {attempt}/3: {e}")
            if attempt < 3:
                time.sleep(0.8 * attempt)
                continue
            raise

    raise RuntimeError(f"unreachable: retries exhausted, last_exc={last_exc}")


def main() -> None:
    # ==== Inline config (as you requested) ====
    model_config = {
        # You can override this without editing code:
        #   $env:MSUICODE_BASE_URL = 'https://www.msuicode.com'
        "base_url": os.getenv("MSUICODE_BASE_URL") or "https://www.msuicode.com",
        "model": "[稳定]gemini-3-pro-image-preview",
        "api_key": "sk-REPLACE_ME",
        "output_dir": "output",
        "name": "with_image_word",
    }

    # Prompt
    prompt = f"""
Primary school mathematics PPT cover illustration, theme “Cao Chong Weighs the Elephant”, set in an ancient Chinese story scene with a warm and soft color tone, early morning riverside atmosphere. A traditional wooden boat is floating on calm water with gentle ripples, an elephant standing on the boat causing slight water displacement, and a smart young ancient Chinese boy (Cao Chong) wearing traditional Hanfu clothing standing nearby with a confident and clever expression. Soft sunlight, warm storytelling feeling.

Cartoon illustration style, children’s book illustration style, flat cartoon design, clean and simple composition. A large blank space is reserved at the top for title text layout. In the blank area, include Chinese title text:

《曹冲称象的故事——称重我很行》

Below the title, place smaller Chinese text:

适用年级：小学数学 三年级上册
教材版本：人教版（2024）
课型：新授课

Decorative math icons are subtly placed in the corners, such as a balance scale icon, digital scale icon, and small “g” and “kg” symbols, integrated softly without clutter.

Aspect ratio 16:9 (standard PPT layout), resolution 1920×1080 or higher, 4K preferred. High resolution, high detail, sharp lines, soft lighting, clear visual hierarchy, educational poster design suitable for Grade 3 students. No messy background, no photorealistic style, no dark atmosphere.
"""

    # Allow overriding via environment variables (optional, avoids hard-coding)
    api_key = os.getenv("MSUICODE_API_KEY") or "sk-7py85fKLExjParjcTSaUrDUsJxhxiAFAZfijcKMv967LHe3l"
    if not api_key or api_key == "sk-REPLACE_ME":
        raise ValueError(
            "Missing API key. Set model_config['api_key'] or set env var MSUICODE_API_KEY."
        )

    resp = generate_image_via_chat(
        base_url=model_config["base_url"],
        api_key=api_key,
        model=model_config["model"],
        prompt=prompt,
    )

    saved = save_images_from_chat_response(resp, out_dir=model_config["output_dir"], name=model_config["name"])
    if saved:
        print("saved:")
        for p in saved:
            print(" ", p)
    else:
        print("No images found in response. Response (truncated):")
        print(json.dumps(resp, ensure_ascii=False, indent=2)[:4000])


if __name__ == "__main__":
    main()
