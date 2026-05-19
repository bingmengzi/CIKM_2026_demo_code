"""Prompts for Agent Engineer (Stage 5) — English version."""

HOME_PAGE_PROMPT = """You are a frontend engineer generating JavaScript code for an educational interactive web application.

Generate the HOME PAGE code for this application:
- Title: {title}
- Subtitle: {subtitle}
- Activities: {activities_summary}
- Available asset URLs: {asset_urls}

REQUIREMENTS:
- Define `window.HOME_PAGE` object with `template` (HTML string) and `init()` function
- Display title and subtitle prominently with attractive typography
- Show 3 activity cards in a grid/row layout
- Each card has: activity number, title, a brief description, and a "Start" button
- Clicking a card calls `ActivityManager.show(N)` where N is the activity id
- Use modern CSS (flexbox/grid), bright child-friendly colors
- Responsive design (works at 1920x1080)
- Use provided asset URLs for backgrounds/decorations where available
- All text in English

OUTPUT: Only the JavaScript code. No markdown fences. No explanation."""

ACTIVITY_CODE_PROMPT = """You are a frontend engineer generating JavaScript code for Activity {activity_id} of an educational interactive web application.

ACTIVITY DETAILS:
- Title: {title}
- Interaction Model: {interaction_model}
- Learning Goal: {learning_goal}
- Interaction Flow: {flow}
- UI Elements needed: {elements}
- Question Configuration: {question_config}
- Available asset URLs: {asset_urls}
- Description: {description}
- Custom Teaching Component (if any): {component_details}

REQUIREMENTS:
- Define `window.ACTIVITY_{activity_id}` object with `template` (HTML string) and `init()` function
- Include a "← Back" button that calls `ActivityManager.show('home')`
- Display the activity title at the top
- Fully implement the specified interaction model with all 10 questions
- Track score and show progress (e.g., "Question 3/10")
- Provide immediate visual feedback for correct/incorrect answers
- Include smooth CSS transitions/animations
- Use provided asset URLs where applicable
- All text and labels in English
- Responsive layout at 1920x1080

AVAILABLE BUILT-IN LIBRARIES (already loaded in the page):
- `TeachingGameEngine`: Drag-and-drop engine. Usage: `new TeachingGameEngine({{container, items, targets, onMatch}})`
- `ActivityManager`: Page navigation (already handles routing between activities)
- `createActivityHeader(title, subtitle)`: Returns HTML for a styled header with back button

OUTPUT: Only the JavaScript code. No markdown fences. No explanation."""
