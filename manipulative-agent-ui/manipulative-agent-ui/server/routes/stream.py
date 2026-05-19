"""GET /api/stream/{session_id} — SSE event stream."""

import asyncio
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from server.session import store

router = APIRouter()


@router.get("/api/stream/{session_id}")
async def stream(session_id: str):
    session = store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def event_generator():
        while True:
            try:
                event = await asyncio.wait_for(session.event_queue.get(), timeout=60.0)
                yield event
                # Stop streaming after completion or error
                if event["event"] in ("complete", "error"):
                    break
            except asyncio.TimeoutError:
                # Send keepalive comment
                yield {"comment": "keepalive"}

    return EventSourceResponse(event_generator())
