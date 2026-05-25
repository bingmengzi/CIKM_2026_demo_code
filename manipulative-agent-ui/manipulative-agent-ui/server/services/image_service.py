import os
import requests
import base64
import uuid
import tempfile
import re
from typing import Optional
from server.config import IMAGE_API_KEY as CONF_IMAGE_API_KEY, IMAGE_API_URL as CONF_IMAGE_API_URL, LLM_TASK_IMAGE
from server.upload_utils import upload_file_to_oss

IMAGE_API_KEY = os.environ.get('OPENAI_API_KEY', CONF_IMAGE_API_KEY)
IMAGE_API_URL = os.environ.get('OPENAI_BASE_URL', CONF_IMAGE_API_URL)
if not IMAGE_API_URL.endswith('/chat/completions'):
    IMAGE_API_URL = IMAGE_API_URL.rstrip('/') + '/chat/completions'
    
IMAGE_MODEL = os.environ.get('IMAGE_MODEL', LLM_TASK_IMAGE)

def generate_single_image(prompt: str, output_dir: Optional[str] = None) -> str:
    headers = {
        'Authorization': f'Bearer {IMAGE_API_KEY}',
        'Content-Type': 'application/json',
    }
    # 改为发送给 /chat/completions 的通用大模型格式 (包含 modalities: image)
    payload = {
        "model": IMAGE_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "modalities": ["text", "image"],
    }
    try:
        response = requests.post(IMAGE_API_URL, json=payload, headers=headers, timeout=120)
        response.raise_for_status()
        data = response.json()
        
        # 兼容该接口返回图数据的内部结构
        try:
            message = data["choices"][0]["message"]
            if "images" in message:
                img_data = message["images"][0]
                if isinstance(img_data, dict):
                    b64_data = img_data.get("image_url", {}).get("url", "") or img_data.get("url", "")
                else:
                    b64_data = str(img_data)
            else:
                b64_data = message.get("content", "")
        except (KeyError, IndexError):
            raise ValueError("No image data in response")

        if b64_data.startswith('http://') or b64_data.startswith('https://'):
            return b64_data

        # Extract base64 from markdown if it's there `![...](data:image/...;base64,...)`
        match = re.search(r'data:image/[^;]+;base64,([a-zA-Z0-9+/=]+)', b64_data)
        if match:
            encoded = match.group(1)
        elif b64_data.startswith('data:image'):
            # format: data:image/png;base64,.....
            _, encoded = b64_data.split(",", 1)
        else:
            encoded = b64_data

        try:
            image_binary = base64.b64decode(encoded)
            if output_dir:
                save_dir = output_dir
                os.makedirs(save_dir, exist_ok=True)
            else:
                save_dir = tempfile.gettempdir()
            
            # Using uuid + .png to ensure unique names
            temp_file_path = os.path.join(save_dir, f"{uuid.uuid4().hex}.png")
            with open(temp_file_path, "wb") as f:
                f.write(image_binary)
            
            uploaded_url = upload_file_to_oss(temp_file_path)
            if uploaded_url:
                return uploaded_url
            else:
                return b64_data if b64_data.startswith('data:image') else f'data:image/png;base64,{b64_data}'
        except Exception as e:
            print(f"Failed to decode base64 or upload image: {e}")
            return b64_data if b64_data.startswith('data:image') else f'data:image/png;base64,{b64_data}'
    except Exception as e:
        print(f'Image generation failed: {e}. Falling back to placeholder.')
        return 'https://placehold.co/400x400/png?text=Auto+Generated+Image'

import asyncio
async def generate_image_async(prompt: str, output_dir: Optional[str] = None) -> str:
    return await asyncio.to_thread(generate_single_image, prompt, output_dir)
