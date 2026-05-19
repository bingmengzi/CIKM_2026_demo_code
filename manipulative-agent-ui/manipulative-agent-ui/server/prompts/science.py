"""Prompts for Agent Science (Stage 0 + 1) — English version."""

COMPONENT_SELECTION_PROMPT = """You are an educational technology expert. Given a teaching topic, determine whether a specialized physical teaching tool component is needed from our component library.

Teaching topic: {description}

Available components in our library:
{available_components}

Rules:
- If the topic involves manipulating a specific physical tool (clock, scale, compass, protractor, etc.) that exists in the library, select it.
- If the topic can be taught with custom-generated visual models (fraction bars, number lines, charts, diagrams), set need_component to false.
- For 3D geometry topics, select component_type "3d_shape".

Respond ONLY in valid JSON format (no markdown fences):
{{
  "need_component": true or false,
  "component_type": "teaching_tool" or "3d_shape" or "none",
  "component_name": "component-name-from-library or empty string",
  "component_name_cn": "Chinese name or empty",
  "component_description": "brief description of why this component fits",
  "reason": "one-sentence reasoning"
}}"""


ACTIVITY_DESIGN_PROMPT = """You are an expert instructional designer specializing in elementary mathematics education. You must design interactive learning activities that are pedagogically sound and technically implementable as web applications.

TASK: Design 3 progressive interactive activities for the following teaching topic.

Topic: {description}
Component information (if a specialized tool is needed): {component_info}

DESIGN PRINCIPLES:
1. Three activities must form a learning progression: Exploration → Practice → Challenge
2. Each activity targets a different cognitive level (understanding → application → analysis)
3. Each activity uses ONE specific interaction model from: slider, click, drag-match, drag-sort, exploration
4. Include exactly 10 questions/tasks per activity with progressive difficulty
5. Address at least one common student misconception
6. All text content and labels should be in English

OUTPUT FORMAT — respond ONLY in valid JSON (no markdown fences, no explanation):
{{
  "meta": {{
    "subject": "Mathematics",
    "grade": "Grade X-Y",
    "topic": "short topic name"
  }},
  "knowledge_analysis": {{
    "core_concepts": ["concept1", "concept2"],
    "learning_objectives": ["objective1", "objective2"],
    "common_misconceptions": ["misconception1"]
  }},
  "home_page": {{
    "title": "App title (short, engaging)",
    "subtitle": "One-line description",
    "visual_design_prompt": "Detailed prompt for generating the home page UI mockup image (describe layout, colors, style)"
  }},
  "activities": [
    {{
      "id": 1,
      "title": "Activity title",
      "aspect": "Which aspect of the topic this covers",
      "learning_goal": "Specific measurable goal",
      "interaction_model": "slider|click|drag-match|drag-sort|exploration",
      "description": "2-3 sentence description of what the student does",
      "visual_design_prompt": "Detailed prompt for generating this activity's UI mockup",
      "elements": ["list of UI elements needed"],
      "flow": "Step-by-step interaction flow",
      "question_config": {{
        "type": "progressive",
        "count": 10,
        "examples": ["example question 1", "example question 2", "example question 3"]
      }}
    }}
  ]
}}"""
