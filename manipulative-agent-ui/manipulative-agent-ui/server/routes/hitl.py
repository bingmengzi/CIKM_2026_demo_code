"""HITL routes — approve and feedback."""

from fastapi import APIRouter, HTTPException
from server.models import ApproveRequest, FeedbackRequest, OkResponse
from server.session import store

router = APIRouter()


@router.post("/api/approve/{session_id}", response_model=OkResponse)
async def approve(session_id: str, req: ApproveRequest):
    print(f"[hitl] /api/approve called: session_id={session_id}, agent={req.agent}, current_agent={store.get(session_id).current_agent if store.get(session_id) else 'N/A'}")
    session = store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.checkpoint_feedback = None
    session.checkpoint_event.set()
    return OkResponse(ok=True)


@router.post("/api/feedback/{session_id}", response_model=OkResponse)
async def feedback(session_id: str, req: FeedbackRequest):
    session = store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.checkpoint_feedback = req.feedback
    session.checkpoint_event.set()
    return OkResponse(ok=True)
