"""Replay pipeline — read saved output from disk and simulate SSE event stream."""

import asyncio
import json
import os
from server.session import Session
from server.sse import emit, emit_thinking


def _load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_text(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


async def _stream_thinking(session: Session, agent: str, text: str, chunk_delay: float = 0.08):
    """Stream thinking text line by line with delay to simulate real-time generation."""
    if not text:
        return
    lines = text.split("\n")
    for line in lines:
        chunk = line + "\n"
        await emit_thinking(session, agent, chunk, "")
        await asyncio.sleep(chunk_delay)


async def run_replay(session: Session, replay_dir: str):
    """Replay a saved pipeline run from disk, simulating SSE events with delays."""
    print(f"[replay] Starting replay from: {replay_dir}")

    if not os.path.isdir(replay_dir):
        raise FileNotFoundError(f"Replay directory not found: {replay_dir}")

    session.status = "running"

    try:
        # ===== Agent_sci: Learning Science =====
        session.current_agent = "science"
        await emit(session, "agent_start", agent="science", message="Starting Learning Science Agent...")
        await asyncio.sleep(1.0)

        # Stream thinking
        thinking = _load_text(os.path.join(replay_dir, "science_thinking.txt"))
        await _stream_thinking(session, "science", thinking, chunk_delay=0.1)

        # Emit structured output
        science_path = os.path.join(replay_dir, "science_output.json")
        if os.path.exists(science_path):
            science_data = _load_json(science_path)
            session.component_info = science_data.get("component_info")
            session.activity_plan = science_data.get("activity_plan")
            if session.activity_plan:
                await emit(session, "agent_output", agent="science",
                           type="activity_plan", data=session.activity_plan)

        await asyncio.sleep(1.0)

        # Checkpoint — wait for user approve
        await emit(session, "checkpoint", agent="science", requires_action=True,
                   summary="Activity design plan ready for review")
        session.status = "paused"
        await session.checkpoint_event.wait()
        session.checkpoint_event.clear()
        session.status = "running"

        await emit(session, "agent_done", agent="science")
        await asyncio.sleep(1.5)

        # ===== Agent_des: Instructional Design =====
        session.current_agent = "design"
        await emit(session, "agent_start", agent="design", message="Starting Instructional Design Agent...")
        await asyncio.sleep(1.0)

        # Stream thinking (first part — before images)
        thinking = _load_text(os.path.join(replay_dir, "design_thinking.txt"))
        thinking_lines = thinking.split("\n") if thinking else []
        # Stream first half of thinking
        half = len(thinking_lines) // 2
        first_half = "\n".join(thinking_lines[:half])
        second_half = "\n".join(thinking_lines[half:])
        await _stream_thinking(session, "design", first_half, chunk_delay=0.06)

        # Load design data
        design_path = os.path.join(replay_dir, "design_output.json")
        design_images = {}
        assets = {}
        if os.path.exists(design_path):
            design_data = _load_json(design_path)
            design_images = design_data.get("design_images", {})
            assets = design_data.get("assets", {})

        # === Simulate image generation (~30s total) ===
        # Emit design images one by one with delays
        session.design_images = design_images
        img_count = len(design_images)
        img_delay = 30.0 / max(img_count, 1)  # distribute 30s across images
        for i, (img_id, img_info) in enumerate(design_images.items()):
            await emit_thinking(session, "design", f"Generating design image: {img_id}...\n", "")
            await asyncio.sleep(img_delay)
            await emit(session, "image_ready", agent="design",
                       id=img_id, url=img_info["url"], prompt=img_info.get("prompt", ""))
            await emit(session, "progress", agent="design",
                       item=f"{img_id} design", done=True, total=img_count, completed=i + 1)

        # Stream second half of thinking
        await _stream_thinking(session, "design", second_half, chunk_delay=0.06)

        # Emit assets with delays
        session.assets = assets
        for asset_id, asset_info in assets.items():
            await emit(session, "asset_ready", agent="design",
                       id=asset_id, url=asset_info["url"],
                       prompt=asset_info.get("prompt", ""),
                       category=asset_info.get("category", ""),
                       activity_id=asset_info.get("activity_id", 0),
                       name=asset_info.get("name", ""))
            await asyncio.sleep(0.5)

        await asyncio.sleep(1.0)

        # Checkpoint — wait for user approve
        await emit(session, "checkpoint", agent="design", requires_action=True,
                   summary="Designs and assets ready for review")
        session.status = "paused"
        await session.checkpoint_event.wait()
        session.checkpoint_event.clear()
        session.status = "running"

        await emit(session, "agent_done", agent="design")
        await asyncio.sleep(1.5)

        # ===== Agent_eng: Engineering =====
        session.current_agent = "engineer"
        await emit(session, "agent_start", agent="engineer", message="Starting Engineering Agent...")
        await asyncio.sleep(1.0)

        # Stream thinking with code generation simulation (~15s)
        thinking = _load_text(os.path.join(replay_dir, "engineer_thinking.txt"))
        thinking_lines = thinking.split("\n") if thinking else []
        if thinking_lines:
            # Slow stream to fill ~15s
            line_delay = 15.0 / max(len(thinking_lines), 1)
            line_delay = max(line_delay, 0.05)  # at least 50ms per line
            for line in thinking_lines:
                await emit_thinking(session, "engineer", line + "\n", "")
                await asyncio.sleep(line_delay)
        else:
            # No thinking text saved, just wait
            await emit_thinking(session, "engineer", "Loading activity framework template...\n", "")
            await asyncio.sleep(3.0)
            await emit_thinking(session, "engineer", "Generating code concurrently (home + 3 activities)...\n", "")
            await asyncio.sleep(8.0)
            await emit_thinking(session, "engineer", "Assembling index.html...\n", "")
            await asyncio.sleep(2.0)
            await emit_thinking(session, "engineer", "Deploying to CDN...\n", "")
            await asyncio.sleep(2.0)

        # Load engineer output
        engineer_path = os.path.join(replay_dir, "engineer_output.json")
        if os.path.exists(engineer_path):
            engineer_data = _load_json(engineer_path)
            session.deploy_url = engineer_data.get("deploy_url")

        # Load generated code
        html_path = os.path.join(replay_dir, "index.html")
        if os.path.exists(html_path):
            session.generated_code = _load_text(html_path)

        # Emit preview_ready
        if session.deploy_url:
            await emit(session, "preview_ready", agent="engineer", url=session.deploy_url)
            await emit_thinking(session, "engineer", f"✓ Deployed: {session.deploy_url}\n", "")

        await asyncio.sleep(1.0)

        # Checkpoint — wait for user approve
        await emit(session, "checkpoint", agent="engineer", requires_action=True,
                   summary="Code generated and deployed — preview ready")
        session.status = "paused"
        await session.checkpoint_event.wait()
        session.checkpoint_event.clear()
        session.status = "running"

        await emit(session, "agent_done", agent="engineer")
        await asyncio.sleep(1.5)

        # ===== Agent_test: Testing (no HITL) =====
        session.current_agent = "test"
        await emit(session, "agent_start", agent="test", message="Starting Testing Agent...")
        await asyncio.sleep(1.0)

        # Load test data
        test_path = os.path.join(replay_dir, "test_output.json")
        verification_history = []
        final_results = []
        if os.path.exists(test_path):
            test_data = _load_json(test_path)
            final_results = test_data.get("verification_results", [])
            verification_history = test_data.get("verification_history", [])

        # Replay verification with full iteration process
        if verification_history:
            await _replay_verification_with_history(session, verification_history, final_results)
        else:
            # Fallback: just replay final results with thinking text
            thinking = _load_text(os.path.join(replay_dir, "test_thinking.txt"))
            await _stream_thinking(session, "test", thinking, chunk_delay=0.08)
            session.verification_results = final_results
            for result in final_results:
                await emit(session, "verify_result", agent="test", **result)
                await asyncio.sleep(1.0)

        await emit(session, "agent_done", agent="test")
        await asyncio.sleep(0.5)

        # ===== Complete =====
        session.status = "complete"
        session.current_agent = None
        await emit(session, "complete", final_url=session.deploy_url)
        print(f"[replay] Replay complete.")

    except Exception as e:
        session.status = "error"
        await emit(session, "error", message=str(e))
        print(f"[replay] ERROR: {e}")
        raise


async def _replay_verification_with_history(session: Session, history: list, final_results: list):
    """Replay the full verify iteration process from recorded history."""
    # Group history by activity_id
    by_activity = {}
    for entry in history:
        act_id = entry["activity_id"]
        if act_id not in by_activity:
            by_activity[act_id] = []
        by_activity[act_id].append(entry)

    # Replay each activity's verification process sequentially
    for act_id, attempts in sorted(by_activity.items()):
        await emit_thinking(session, "test", f"\n[Activity {act_id}] Launching headless Chrome...\n", "")
        await asyncio.sleep(2.0)

        for attempt_entry in attempts:
            attempt_num = attempt_entry.get("attempt", 1)
            passed = attempt_entry.get("passed", False)
            screenshot = attempt_entry.get("screenshot", "")
            checks = attempt_entry.get("checks", [])

            await emit_thinking(session, "test",
                f"[Activity {act_id}] Attempt {attempt_num} — capturing screenshot...\n", "")
            await asyncio.sleep(3.0)

            await emit_thinking(session, "test",
                f"[Activity {act_id}] Running LLM verification...\n", "")
            await asyncio.sleep(2.0)

            if passed:
                passed_count = sum(1 for c in checks if c.get("passed"))
                await emit_thinking(session, "test",
                    f"[Activity {act_id}] ✓ PASSED ({passed_count}/{len(checks)})\n", "")
            else:
                failed_items = [c["name"] for c in checks if not c.get("passed")]
                passed_count = sum(1 for c in checks if c.get("passed"))
                await emit_thinking(session, "test",
                    f"[Activity {act_id}] ✗ FAILED ({passed_count}/{len(checks)}) - {', '.join(failed_items)}\n", "")

                # If not the last attempt, show fixing
                if attempt_entry != attempts[-1]:
                    await emit_thinking(session, "test",
                        f"[Activity {act_id}] Auto-fixing (attempt {attempt_num + 1})...\n", "")
                    await asyncio.sleep(4.0)

            await asyncio.sleep(1.0)

    # Emit final results
    session.verification_results = final_results
    for result in final_results:
        await emit(session, "verify_result", agent="test", **result)
        await asyncio.sleep(0.5)

    # Summary
    all_passed = all(r.get("passed") for r in final_results)
    if all_passed:
        await emit_thinking(session, "test", f"\n✓ All activities verified — {len(final_results)}/{len(final_results)} passed\n", "")
    else:
        await emit_thinking(session, "test", "\n⚠ Some activities required fixes. Final deployment updated.\n", "")
