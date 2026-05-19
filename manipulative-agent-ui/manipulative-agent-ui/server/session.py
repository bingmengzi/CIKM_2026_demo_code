"""Session state management."""

import asyncio
import uuid
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class Session:
    id: str
    description: str
    status: str = "created"  # created | running | paused | complete | error
    current_agent: Optional[str] = None

    # Pipeline state
    thinking_logs: dict = field(default_factory=lambda: {"science": "", "design": "", "engineer": "", "test": ""})
    component_info: Optional[dict] = None
    activity_plan: Optional[dict] = None
    design_images: dict = field(default_factory=dict)   # {id: {url, prompt}}
    assets: dict = field(default_factory=dict)          # {id: {url, prompt, category, activity_id}}
    generated_code: Optional[str] = None
    deploy_url: Optional[str] = None
    verification_results: list = field(default_factory=list)
    verification_history: list = field(default_factory=list)  # all attempts for replay

    # HITL control
    checkpoint_event: asyncio.Event = field(default_factory=asyncio.Event)
    checkpoint_feedback: Optional[str] = None

    # SSE event queue
    event_queue: asyncio.Queue = field(default_factory=asyncio.Queue)


class SessionStore:
    """In-memory session store."""

    def __init__(self):
        self._sessions: dict[str, Session] = {}

    def create(self, description: str) -> Session:
        session_id = str(uuid.uuid4())[:8]
        session = Session(id=session_id, description=description)
        self._sessions[session_id] = session
        return session

    def get(self, session_id: str) -> Optional[Session]:
        return self._sessions.get(session_id)

    def delete(self, session_id: str):
        self._sessions.pop(session_id, None)


# Global singleton
store = SessionStore()
