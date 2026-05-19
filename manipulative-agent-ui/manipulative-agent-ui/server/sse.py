"""SSE event emission utilities."""

import json
from typing import Any
from server.session import Session


async def emit(session: Session, event: str, **data: Any):
    """Push an SSE event to the session's event queue."""
    payload = json.dumps(data, ensure_ascii=False)
    await session.event_queue.put({"event": event, "data": payload})


async def emit_thinking(session: Session, agent: str, delta: str, content: str):
    """Push a streaming thinking chunk."""
    # Collect thinking text for replay recording
    if hasattr(session, "thinking_logs") and agent in session.thinking_logs:
        session.thinking_logs[agent] += delta
    await session.event_queue.put({
        "event": "agent_thinking",
        "data": json.dumps({
            "agent": agent,
            "delta": delta,
            "content": content,
        }, ensure_ascii=False),
    })
