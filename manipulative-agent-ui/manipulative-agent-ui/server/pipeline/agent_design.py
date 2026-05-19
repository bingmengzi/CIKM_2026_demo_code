"""Agent Design — UI mockup generation + asset generation (Stage 2 + 3 + 4)."""

import asyncio
from pathlib import Path
from server.session import Session
from server.sse import emit, emit_thinking
from server.services.image_service import generate_image_async
from server.services.llm_service import llm_chat, build_messages
from server.config import LLM_TASK_MAIN, OUTPUT_DIR
from server.prompts.design import DESIGN_IMAGE_PROMPT_TEMPLATE, ASSET_PLANNING_PROMPT


async def run(session: Session):
    """Execute design agent pipeline."""
    plan = session.activity_plan
    if not plan:
        raise ValueError("No activity plan available — run Agent Science first")

    activities = plan.get("activities", [])
    home = plan.get("home_page", {})
    
    # Define session output directory for images
    session_dir = str(OUTPUT_DIR / session.id)

    # --- Stage 2: Design Image Generation ---
    await emit_thinking(session, "design", "Generating UI design mockups...\n", "")

    # Build prompts for 4 designs (home + 3 activities)
    design_tasks = []
    design_ids = []

    # Home page
    home_prompt = home.get("visual_design_prompt", f"Educational app home page for: {session.description}")
    design_tasks.append(generate_image_async(home_prompt, output_dir=session_dir))
    design_ids.append("home")

    # Activities
    for act in activities:
        act_prompt = act.get("visual_design_prompt", f"Educational activity UI: {act.get('title', '')}")
        design_tasks.append(generate_image_async(act_prompt, output_dir=session_dir))
        design_ids.append(f"activity_{act.get('id', '')}")

    # Run concurrently
    results = await asyncio.gather(*design_tasks, return_exceptions=True)

    completed = 0
    total = len(results)
    for i, result in enumerate(results):
        img_id = design_ids[i]
        if isinstance(result, Exception):
            await emit(session, "progress", agent="design", item=f"{img_id} design", done=False, total=total, completed=completed, error=str(result))
            continue

        completed += 1
        prompt_used = home_prompt if i == 0 else activities[i - 1].get("visual_design_prompt", "")
        session.design_images[img_id] = {"url": result, "prompt": prompt_used}
        await emit(session, "image_ready", agent="design", id=img_id, url=result, prompt=prompt_used)
        await emit(session, "progress", agent="design", item=f"{img_id} design", done=True, total=total, completed=completed)

    await emit_thinking(session, "design", f"\n{completed}/{total} design images generated.\n", "")

    # --- Stage 3 + 4: Asset Planning + Generation ---
    await emit_thinking(session, "design", "\nPlanning and generating assets...\n", "")

    asset_count = 0
    for act in activities:
        act_id = act.get("id", 0)

        # Plan assets via LLM
        messages = build_messages(
            {"activity": str(act), "description": session.description},
            ASSET_PLANNING_PROMPT,
        )
        plan_text = await llm_chat(messages, LLM_TASK_MAIN)

        # Parse asset list (simplified — in production would parse full JSON)
        # For now, generate a background + 2 element assets per activity
        asset_prompts = _extract_asset_prompts(plan_text, act_id)

        # Generate assets concurrently
        tasks = [generate_image_async(p["prompt"], output_dir=session_dir) for p in asset_prompts]
        asset_results = await asyncio.gather(*tasks, return_exceptions=True)

        for j, (asset_info, result) in enumerate(zip(asset_prompts, asset_results)):
            if isinstance(result, Exception):
                continue
            asset_id = f"a{act_id}_{asset_info['name']}"
            session.assets[asset_id] = {
                "url": result,
                "prompt": asset_info["prompt"],
                "category": asset_info["category"],
                "activity_id": act_id,
                "name": asset_info["name"],
            }
            asset_count += 1
            await emit(session, "asset_ready", agent="design",
                       id=asset_id, url=result, prompt=asset_info["prompt"],
                       category=asset_info["category"], activity_id=act_id, name=asset_info["name"])

    await emit_thinking(session, "design", f"\nAll assets generated ({asset_count} total).\n", "")


def _extract_asset_prompts(plan_text: str, activity_id: int) -> list[dict]:
    """Extract asset generation prompts from LLM planning output.
    Returns a simplified list — production version would parse full JSON.
    """
    # Default fallback: generate basic assets
    return [
        {
            "name": "background",
            "prompt": f"Clean educational background for activity {activity_id}, subtle pattern, light colors",
            "category": "background",
        },
        {
            "name": "element_1",
            "prompt": f"Cartoon educational element for math activity, flat style, transparent background",
            "category": "interactive",
        },
        {
            "name": "element_2",
            "prompt": f"Cute mascot character for educational app, simple flat illustration, transparent background",
            "category": "static",
        },
    ]
