"""Agent Engineer — Code generation + component integration + deployment (Stage 5 + 6 + 7)."""

import asyncio
import os
import tempfile
import traceback
from server.session import Session
from server.sse import emit, emit_thinking
from server.services.llm_service import llm_chat, build_messages
from server.services.upload_service import upload_file_async, upload_folder_async
from server.upload_utils import upload_file_to_oss
from server.config import LLM_TASK_CODE, HTML_TEMPLATE_PATH, OUTPUT_DIR
from server.prompts.engineer import HOME_PAGE_PROMPT, ACTIVITY_CODE_PROMPT


def _load_html_template() -> str:
    """Load the HTML framework template."""
    with open(HTML_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return f.read()


async def _generate_home_code(session: Session, home: dict, activities: list) -> str:
    """Generate home page code."""
    home_data = {
        "title": home.get("title", "Interactive Learning"),
        "subtitle": home.get("subtitle", ""),
        "activities_summary": str([{"id": a["id"], "title": a["title"]} for a in activities]),
        "asset_urls": str(session.design_images),
    }
    messages = build_messages(home_data, HOME_PAGE_PROMPT)
    code = await llm_chat(messages, LLM_TASK_CODE)
    await emit_thinking(session, "engineer", "✓ Home page complete\n", "")
    return _extract_js(code)


async def _generate_activity_code(session: Session, act: dict) -> tuple[int, str]:
    """Generate code for a single activity."""
    act_id = act.get("id", 0)
    act_assets = {k: v["url"] for k, v in session.assets.items() if v.get("activity_id") == act_id}

    act_data = {
        "activity_id": str(act_id),
        "title": act.get("title", ""),
        "interaction_model": act.get("interaction_model", ""),
        "learning_goal": act.get("learning_goal", ""),
        "flow": str(act.get("flow", "")),
        "elements": str(act.get("elements", "")),
        "question_config": str(act.get("question_config", "")),
        "asset_urls": str(act_assets),
        "description": act.get("description", ""),
        "component_details": "",
    }
    
    # Inject component details if present
    if session.component_info and session.component_info.get("need_component"):
        import json
        from server.config import COMPONENT_MAPPING_PATH
        try:
            with open(COMPONENT_MAPPING_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                mapping = data.get("mappings", {}) if "mappings" in data else data
            
            c_name = session.component_info.get("component_name")
            for k, info in mapping.items():
                if not isinstance(info, dict):
                    continue
                if k == c_name or info.get("component_name") == c_name:
                    cap_analysis = info.get("capability_analysis", {})
                    act_data["component_details"] = f"COMPONENT NAME: {c_name}\nCAPABILITIES AND API API DETAILS: {json.dumps(cap_analysis, ensure_ascii=False)}\nUse <{c_name}></{c_name}> custom element tag to mount the component."
                    break
        except Exception as e:
            act_data["component_details"] = f"WE ARE USING COMPONENT: {session.component_info.get('component_name', '')}"

    messages = build_messages(act_data, ACTIVITY_CODE_PROMPT)
    code = await llm_chat(messages, LLM_TASK_CODE)
    await emit_thinking(session, "engineer", f"✓ Activity {act_id} — {act.get('title', '')} complete\n", "")
    return act_id, _extract_js(code)


async def run(session: Session):
    """Execute engineering agent pipeline — concurrent code generation."""
    plan = session.activity_plan
    if not plan:
        raise ValueError("No activity plan available")

    activities = plan.get("activities", [])
    home = plan.get("home_page", {})

    # Load template
    try:
        template = _load_html_template()
    except FileNotFoundError:
        # If template not found, use a minimal fallback
        print(f"[agent_engineer] WARNING: HTML template not found at {HTML_TEMPLATE_PATH}, using minimal template")
        template = """<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{{APP_TITLE}}</title>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden}.page{display:none;width:100%;height:100%;position:absolute;top:0;left:0;overflow:auto}.page.active{display:block}</style>
</head><body>
<div id="home-page" class="page active"></div>
<div id="activity-1" class="page"></div>
<div id="activity-2" class="page"></div>
<div id="activity-3" class="page"></div>
<script>
window.ActivityManager={currentPage:'home',show:function(id){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});var pageId,dataKey;if(id===0||id==='home'){pageId='home-page';dataKey='HOME_PAGE'}else{pageId='activity-'+id;dataKey='ACTIVITY_'+id}var c=document.getElementById(pageId);if(!c)return;c.classList.add('active');this.currentPage=id;var d=window[dataKey];if(d&&!c.dataset.rendered){c.innerHTML=d.template;c.dataset.rendered='1';if(typeof d.init==='function')d.init()}}};
</script>
<script>/* __HOME_PAGE_CODE__ */</script>
<script>/* __ACTIVITY_1_CODE__ */</script>
<script>/* __ACTIVITY_2_CODE__ */</script>
<script>/* __ACTIVITY_3_CODE__ */</script>
<script>document.addEventListener('DOMContentLoaded',function(){ActivityManager.show('home')});if(document.readyState!=='loading'){ActivityManager.show('home')}</script>
</body></html>"""

    # --- Stage 5: Code Generation (CONCURRENT) ---
    await emit_thinking(session, "engineer", "Loading activity framework template...\n", "")
    await emit_thinking(session, "engineer", "Generating code concurrently (home + 3 activities)...\n", "")

    # Launch all code generation tasks in parallel
    tasks = [
        _generate_home_code(session, home, activities),
        *[_generate_activity_code(session, act) for act in activities],
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Process results
    home_code = ""
    activity_codes = {}

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"[agent_engineer] ERROR in task {i}: {result}")
            traceback.print_exception(type(result), result, result.__traceback__)
            await emit_thinking(session, "engineer", f"✗ Error in task {i}: {result}\n", "")
            raise result
        if i == 0:
            home_code = result
        else:
            act_id, code = result
            activity_codes[act_id] = code

    # --- Assemble HTML ---
    await emit_thinking(session, "engineer", "\nAssembling index.html...\n", "")
    html = template.replace("{{APP_TITLE}}", home.get("title", "Interactive Learning"))
    
    # Inject component scripts if selected
    extra_scripts = ""
    if session.component_info and session.component_info.get("component_urls"):
        for url_info in session.component_info.get("component_urls"):
            script_url = url_info.get("url")
            if script_url:
                extra_scripts += f'<script src="{script_url}"></script>\n'
    if extra_scripts:
        html = html.replace("</head>", f"{extra_scripts}</head>")
        
    html = html.replace("/* __HOME_PAGE_CODE__ */", home_code)
    for act_id, code in activity_codes.items():
        html = html.replace(f"/* __ACTIVITY_{act_id}_CODE__ */", code)

    session.generated_code = html
    print(f"[agent_engineer] HTML assembled, length={len(html)}")

    # --- Stage 6 + 7: Deploy ---
    await emit_thinking(session, "engineer", "Deploying to CDN...\n", "")

    session_output_dir = OUTPUT_DIR / session.id
    session_output_dir.mkdir(parents=True, exist_ok=True)
    html_path = str(session_output_dir / "index.html")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[agent_engineer] Saved to {html_path}, uploading...")

    # Upload the single HTML file (simpler and more reliable than folder upload)
    try:
        from server.upload_utils import compress_and_upload_file
        # Uploading file as a folder project using the wrapper
        url = await asyncio.to_thread(compress_and_upload_file, html_path)
        if url:
            session.deploy_url = url
            await emit(session, "preview_ready", agent="engineer", url=url)
            await emit_thinking(session, "engineer", f"✓ Deployed: {url}\n", "")
            print(f"[agent_engineer] Deploy success: {url}")
        else:
            # Fallback to direct oss upload
            url = await asyncio.to_thread(upload_file_to_oss, html_path)
            if url:
                session.deploy_url = url
                await emit(session, "preview_ready", agent="engineer", url=url)
                await emit_thinking(session, "engineer", f"✓ Deployed: {url}\n", "")
                print(f"[agent_engineer] Deploy fallback success: {url}")
            else:
                print("[agent_engineer] ERROR: upload_file returned None")
                await emit_thinking(session, "engineer", "✗ Upload failed (returned None)\n", "")
                raise RuntimeError("Failed to deploy — upload returned None")
    except Exception as e:
        print(f"[agent_engineer] UPLOAD ERROR: {e}")
        traceback.print_exc()
        raise


async def apply_feedback(session: Session, feedback: str):
    """Re-generate code with feedback."""
    await emit_thinking(session, "engineer", f"\n[Feedback: {feedback}]\nRegenerating...\n", "")
    await run(session)


def _extract_js(text: str) -> str:
    """Extract JavaScript code from LLM output (remove markdown fences)."""
    if "```javascript" in text:
        return text.split("```javascript")[1].split("```")[0].strip()
    if "```js" in text:
        return text.split("```js")[1].split("```")[0].strip()
    if "```" in text:
        return text.split("```")[1].split("```")[0].strip()
    return text.strip()
