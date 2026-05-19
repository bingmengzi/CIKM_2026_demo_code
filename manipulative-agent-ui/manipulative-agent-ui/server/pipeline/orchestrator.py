"""Pipeline orchestrator — controls the flow between agents with HITL checkpoints."""

import json
import os
from datetime import datetime
from server.session import Session
from server.sse import emit
from server.pipeline import agent_science, agent_design, agent_engineer, agent_test
from server.config import OUTPUT_DIR


def _save_dir(session: Session) -> str:
    """Get or create the output directory for this session."""
    d = str(OUTPUT_DIR / session.id)
    os.makedirs(d, exist_ok=True)
    return d


def _save_json(path: str, data):
    """Save JSON data to file."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _save_text(path: str, text: str):
    """Save text to file."""
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


async def run_pipeline(session: Session):
    """Run the full multi-agent pipeline with HITL checkpoints."""
    session.status = "running"
    out = _save_dir(session)

    # Save meta
    _save_json(os.path.join(out, "meta.json"), {
        "session_id": session.id,
        "description": session.description,
        "timestamp": datetime.now().isoformat(),
    })

    try:
        # ===== Agent_sci: Learning Science =====
        session.current_agent = "science"
        await emit(session, "agent_start", agent="science", message="Starting Learning Science Agent...")

        await agent_science.run(session)

        # Save science output
        _save_json(os.path.join(out, "science_output.json"), {
            "component_info": session.component_info,
            "activity_plan": session.activity_plan,
        })
        _save_text(os.path.join(out, "science_thinking.txt"), session.thinking_logs.get("science", ""))

        await emit(session, "checkpoint", agent="science", requires_action=True,
                   summary="Activity design plan ready for review")
        session.status = "paused"
        await session.checkpoint_event.wait()
        session.checkpoint_event.clear()
        session.status = "running"

        # If feedback provided, re-run with modifications
        if session.checkpoint_feedback:
            await agent_science.apply_feedback(session, session.checkpoint_feedback)
            session.checkpoint_feedback = None

        await emit(session, "agent_done", agent="science")

        # ===== Agent_des: Instructional Design =====
        session.current_agent = "design"
        await emit(session, "agent_start", agent="design", message="Starting Instructional Design Agent...")

        await agent_design.run(session)

        # Save design output
        _save_json(os.path.join(out, "design_output.json"), {
            "design_images": session.design_images,
            "assets": session.assets,
        })
        _save_text(os.path.join(out, "design_thinking.txt"), session.thinking_logs.get("design", ""))

        await emit(session, "checkpoint", agent="design", requires_action=True,
                   summary="Designs and assets ready for review")
        session.status = "paused"
        await session.checkpoint_event.wait()
        session.checkpoint_event.clear()
        session.status = "running"

        if session.checkpoint_feedback:
            session.checkpoint_feedback = None  # feedback handled via regenerate-image API

        await emit(session, "agent_done", agent="design")

        # ===== Agent_eng: Engineering =====
        session.current_agent = "engineer"
        await emit(session, "agent_start", agent="engineer", message="Starting Engineering Agent...")

        await agent_engineer.run(session)

        await emit(session, "checkpoint", agent="engineer", requires_action=True,
                   summary="Code generated and deployed — preview ready")
        session.status = "paused"
        await session.checkpoint_event.wait()
        session.checkpoint_event.clear()
        session.status = "running"

        if session.checkpoint_feedback:
            await agent_engineer.apply_feedback(session, session.checkpoint_feedback)
            session.checkpoint_feedback = None

        # Save engineer output
        _save_json(os.path.join(out, "engineer_output.json"), {
            "deploy_url": session.deploy_url,
        })
        _save_text(os.path.join(out, "engineer_thinking.txt"), session.thinking_logs.get("engineer", ""))
        if session.generated_code:
            _save_text(os.path.join(out, "index.html"), session.generated_code)

        await emit(session, "agent_done", agent="engineer")

        # ===== Agent_test: Testing (no HITL) =====
        print(f"[orchestrator] === Starting Agent Test === deploy_url={session.deploy_url}")
        session.current_agent = "test"
        await emit(session, "agent_start", agent="test", message="Starting Testing Agent...")

        try:
            await agent_test.run(session)
            print("[orchestrator] agent_test.run() completed successfully")
        except Exception as test_err:
            print(f"[orchestrator] agent_test.run() FAILED: {test_err}")
            raise

        # Save test output (includes full verification history with all attempts)
        _save_json(os.path.join(out, "test_output.json"), {
            "verification_results": session.verification_results,
            "verification_history": getattr(session, "verification_history", []),
        })
        _save_text(os.path.join(out, "test_thinking.txt"), session.thinking_logs.get("test", ""))

        await emit(session, "agent_done", agent="test")

        # ===== Complete =====
        session.status = "complete"
        session.current_agent = None
        await emit(session, "complete", final_url=session.deploy_url)
        print(f"[orchestrator] Pipeline complete. Output saved to: {out}")

    except Exception as e:
        session.status = "error"
        await emit(session, "error", message=str(e))
        raise
