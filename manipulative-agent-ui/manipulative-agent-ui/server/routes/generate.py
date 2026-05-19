"""POST /api/generate — start a new pipeline session."""

import os
import asyncio
from fastapi import APIRouter
from server.models import GenerateRequest, GenerateResponse
from server.session import store
from server.pipeline.orchestrator import run_pipeline
from server.pipeline.replay import run_replay

router = APIRouter()

# Cache directory for pre-computed pipeline results (speeds up repeated demos)
_CACHE_DIR = os.environ.get("PIPELINE_CACHE_DIR", "")


@router.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    session = store.create(description=req.description)

    if _CACHE_DIR and os.path.isdir(_CACHE_DIR):
        asyncio.create_task(run_replay(session, _CACHE_DIR))
    else:
        asyncio.create_task(run_pipeline(session))

    return GenerateResponse(session_id=session.id)
