"""Agent Science — Component selection + multi-activity design (Stage 0 + 1)."""

import json
from pathlib import Path
from server.session import Session
from server.sse import emit, emit_thinking
from server.services.llm_service import llm_chat, build_messages
from server.config import COMPONENT_MAPPING_PATH, LLM_TASK_MAIN, OUTPUT_DIR
from server.prompts.science import COMPONENT_SELECTION_PROMPT, ACTIVITY_DESIGN_PROMPT


def _load_component_mapping() -> dict:
    """Load component mapping dict from JSON (handles nested 'mappings' root)."""
    try:
        with open(COMPONENT_MAPPING_PATH, "rb") as f:
            raw = f.read()

        # Try UTF-8 (with BOM), then UTF-16 (little/big endian)
        for enc in ("utf-8-sig", "utf-16", "utf-16-le", "utf-16-be"):
            try:
                data = json.loads(raw.decode(enc))
                return data.get("mappings", {}) if "mappings" in data else data
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue

        raise UnicodeDecodeError("utf-8", raw, 0, 1, "Unable to decode component mapping")
    except Exception as e:
        print(f"[agent_science] Error loading components: {e}")
        return {}


def _load_available_components() -> str:
    """Load component mapping and format as text for LLM."""
    mapping = _load_component_mapping()
    if not mapping:
        return "(No component library available)"

    components_text = []
    for name, info in mapping.items():
        if isinstance(info, dict):
            desc = info.get("original_tool", {}).get("description", "")
            components_text.append(f"- {name}: {desc}")
    return "\n".join(components_text)




def _enrich_component_urls(component_info: dict):
    """Fetch corresponding component_urls from the JSON and embed them into component_info."""
    if not component_info or not component_info.get("need_component"):
        return
    
    comp_name = component_info.get("component_name")
    if not comp_name:
        return
        
    try:
        mapping = _load_component_mapping()
        if not mapping:
            return

        # Match by key or component_name fields
        for key, info in mapping.items():
            if not isinstance(info, dict):
                continue
            if key == comp_name or info.get("component_name") == comp_name or info.get("component_id") == comp_name:
                component_info["component_urls"] = info.get("component_urls", [])
                break
    except Exception as e:
        print(f"[agent_science] Failed to enrich component urls: {e}")


def _write_session_log(session: Session, filename: str, content: str):
    """Write debug logs to output/{session_id}/filename."""
    try:
        session_dir = Path(OUTPUT_DIR) / session.id
        session_dir.mkdir(parents=True, exist_ok=True)
        log_path = session_dir / filename
        log_path.write_text(content, encoding="utf-8")
    except Exception as e:
        print(f"[agent_science] Failed to write session log {filename}: {e}")


async def run(session: Session):
    """Execute learning science agent pipeline."""

    # --- Stage 0: Component Selection ---
    await emit_thinking(session, "science", "Scanning component library...\n", "Scanning component library...\n")

    available_components = _load_available_components()
    _write_session_log(
        session,
        "science_component_library.txt",
        f"Component library snapshot:\n{available_components}\n",
    )
    messages = build_messages(
        {"description": session.description, "available_components": available_components},
        COMPONENT_SELECTION_PROMPT,
    )
    component_result_text = await llm_chat(messages, LLM_TASK_MAIN)
    _write_session_log(
        session,
        "science_component_selection.txt",
        "\n".join(
            [
                f"Teacher input: {session.description}",
                "---- Component selection prompt ----",
                COMPONENT_SELECTION_PROMPT,
                "---- LLM response ----",
                component_result_text,
            ]
        ),
    )

    try:
        session.component_info = json.loads(component_result_text)
    except json.JSONDecodeError:
        session.component_info = {"need_component": False, "component_type": "none"}

    _enrich_component_urls(session.component_info)

    component_summary = (
        f"Component selected: {session.component_info.get('component_name', 'None')}"
        if session.component_info.get("need_component")
        else "No physical component needed — custom visual generation."
    )
    _write_session_log(
        session,
        "science_component_summary.txt",
        component_summary + "\n" + json.dumps(session.component_info, ensure_ascii=False, indent=2),
    )
    await emit_thinking(session, "science", component_summary + "\n\n", component_summary)

    # --- Stage 1: Multi-Activity Design ---
    await emit_thinking(session, "science", "Designing 3 progressive activities...\n", "")

    design_data = {
        "description": session.description,
        "component_info": json.dumps(session.component_info, ensure_ascii=False) if session.component_info.get("need_component") else "None",
    }
    messages = build_messages(design_data, ACTIVITY_DESIGN_PROMPT)
    design_result_text = await llm_chat(messages, LLM_TASK_MAIN)

    try:
        session.activity_plan = json.loads(design_result_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown fences
        if "```json" in design_result_text:
            json_str = design_result_text.split("```json")[1].split("```")[0].strip()
            session.activity_plan = json.loads(json_str)
        else:
            raise ValueError(f"Failed to parse activity design JSON: {design_result_text[:200]}")

    # Emit structured output
    await emit(session, "agent_output", agent="science", type="activity_plan", data=session.activity_plan)

    # Stream a summary for the thinking panel
    activities = session.activity_plan.get("activities", [])
    summary_lines = []
    for act in activities:
        summary_lines.append(f"• Activity {act.get('id', '?')}: {act.get('title', '')} ({act.get('interaction_model', '')})")
    summary = "\n".join(summary_lines)
    await emit_thinking(session, "science", f"\nDesigned activities:\n{summary}\n", "")


async def apply_feedback(session: Session, feedback: str):
    """Re-run activity design with user feedback incorporated."""
    await emit_thinking(session, "science", f"\n[Teacher feedback: {feedback}]\nAdjusting design...\n", "")

    design_data = {
        "description": session.description,
        "component_info": json.dumps(session.component_info, ensure_ascii=False) if session.component_info and session.component_info.get("need_component") else "None",
        "feedback": feedback,
    }
    messages = build_messages(design_data, ACTIVITY_DESIGN_PROMPT + "\n\nTeacher feedback to incorporate: {feedback}")
    design_result_text = await llm_chat(messages, LLM_TASK_MAIN)

    try:
        session.activity_plan = json.loads(design_result_text)
    except json.JSONDecodeError:
        if "```json" in design_result_text:
            json_str = design_result_text.split("```json")[1].split("```")[0].strip()
            session.activity_plan = json.loads(json_str)

    _enrich_component_urls(session.component_info)
    
    await emit(session, "agent_output", agent="science", type="activity_plan", data=session.activity_plan)
