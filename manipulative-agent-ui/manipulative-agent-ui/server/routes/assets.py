"""POST /api/regenerate-image — regenerate a single image with new prompt."""

import asyncio
from fastapi import APIRouter, HTTPException
from server.models import RegenerateImageRequest, RegenerateImageResponse
from server.session import store
from server.services.image_service import generate_single_image

router = APIRouter()


@router.post("/api/regenerate-image/{session_id}", response_model=RegenerateImageResponse)
async def regenerate_image(session_id: str, req: RegenerateImageRequest):
    session = store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        url = await asyncio.to_thread(generate_single_image, req.new_prompt)
        # Update session state
        if req.image_id in session.design_images:
            session.design_images[req.image_id]["url"] = url
            session.design_images[req.image_id]["prompt"] = req.new_prompt
        elif req.image_id in session.assets:
            session.assets[req.image_id]["url"] = url
            session.assets[req.image_id]["prompt"] = req.new_prompt

        return RegenerateImageResponse(ok=True, url=url)
    except Exception as e:
        return RegenerateImageResponse(ok=False, url=None)
