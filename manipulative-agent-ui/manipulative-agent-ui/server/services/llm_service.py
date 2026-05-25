import os
import asyncio
from typing import Optional
from openai import AsyncOpenAI
from server.config import LLM_API_KEY, LLM_API_URL

api_key = os.environ.get('OPENAI_API_KEY', LLM_API_KEY)
base_url = os.environ.get('OPENAI_BASE_URL', LLM_API_URL)
DEFAULT_MODEL = os.environ.get('OPENAI_MODEL', 'deepseek-chat')

client = AsyncOpenAI(api_key=api_key, base_url=base_url)

async def llm_chat(messages: list, task: str, temperature: Optional[float] = None) -> str:
    model_to_use = task if task and isinstance(task, str) else DEFAULT_MODEL
    kwargs = {'model': model_to_use, 'messages': messages}
    if temperature is not None:
        kwargs['temperature'] = temperature
    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.content

async def llm_chat_stream(messages: list, task: str) -> str:
    return await llm_chat(messages, task)

def build_messages(data: dict, prompt: str, img_path: Optional[list] = None, system_prompt: Optional[str] = None) -> list:
    formatted_prompt = prompt.format(**data)
    messages = []
    if system_prompt:
        messages.append({'role': 'system', 'content': system_prompt})
    if not img_path:
        messages.append({'role': 'user', 'content': formatted_prompt})
    else:
        user_content = [{'type': 'text', 'text': formatted_prompt}]
        for path in img_path:
            user_content.append({'type': 'image_url', 'image_url': {'url': path}})
        messages.append({'role': 'user', 'content': user_content})
    return messages
