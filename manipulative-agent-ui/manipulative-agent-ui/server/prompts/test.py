"""Prompts for Agent Test (Stage 8) — English version."""

VERIFICATION_PROMPT = """You are a QA engineer performing automated verification of an educational interactive web application.

Examine this screenshot of Activity {activity_id} ("{activity_title}") along with the browser console logs.

Console logs (last 20 entries):
{console_logs}

VERIFY these 5 items by examining the screenshot and logs:
1. Return button visible — Is there a visible "Back" or "Home" navigation button?
2. Activity title displayed — Is the activity title clearly shown on the page?
3. Core content functional — Does the main interactive area show expected elements (not blank/broken)?
4. Question navigation — Are progress indicators or navigation controls visible (e.g., "1/10", Next button)?
5. No console errors — Are there any SEVERE/ERROR level JavaScript errors in the console logs?

Respond ONLY in valid JSON (no markdown fences):
{{
  "passed": true or false,
  "failed_count": 0 to 5,
  "checks": {{
    "return_button": true or false,
    "activity_title": true or false,
    "core_content": true or false,
    "question_nav": true or false,
    "no_console_errors": true or false
  }},
  "issues": ["description of each issue found"],
  "fix_suggestion": "specific code change to fix the issues, or empty string if all passed"
}}"""
