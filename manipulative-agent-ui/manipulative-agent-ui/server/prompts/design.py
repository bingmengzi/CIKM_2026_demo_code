"""Prompts for Agent Design (Stage 2 + 3 + 4) — English version."""

DESIGN_IMAGE_PROMPT_TEMPLATE = """High quality educational UI design, minimalist, clean layout, vector style, flat illustration, bright colors suitable for kids learning, white simple background, high resolution, 1920x1080. {prompt}"""

ASSET_PLANNING_PROMPT = """You are a visual asset planner for educational interactive web applications targeting elementary school students.

Given this activity design, identify all visual assets that need to be generated as individual images.

Activity details: {activity}
Overall topic: {description}

RULES:
- Each activity needs: 1 background + interactive elements + decorative elements
- Interactive elements: things the student manipulates (drag items, clickable objects)
- Static elements: decorations, mascots, icons, labels
- All elements (except backgrounds) should be designed for transparent PNG output
- Keep it minimal: 3-5 assets per activity maximum
- Prompts should describe SINGLE isolated elements, not full scenes

Respond ONLY in valid JSON (no markdown fences):
{{
  "assets": [
    {{
      "name": "descriptive_snake_case_name",
      "category": "background" or "interactive" or "static",
      "generation_prompt": "Detailed image generation prompt. For non-backgrounds: single isolated element, flat cartoon style, simple clean design, transparent background. For backgrounds: full 1920x1080 scene."
    }}
  ]
}}"""
