"""Pydantic models for request/response schemas."""

from pydantic import BaseModel
from typing import Optional


class GenerateRequest(BaseModel):
    description: str


class GenerateResponse(BaseModel):
    session_id: str


class ApproveRequest(BaseModel):
    agent: str


class FeedbackRequest(BaseModel):
    agent: str
    feedback: str


class RegenerateImageRequest(BaseModel):
    image_id: str
    new_prompt: str


class RegenerateImageResponse(BaseModel):
    ok: bool
    url: Optional[str] = None


class OkResponse(BaseModel):
    ok: bool
