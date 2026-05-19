import type { AgentId } from '@/types'

export const agentMessages: Record<AgentId, string> = {
  science: `Analyzing teaching requirements: "Fraction comparison for Grade 3-4 students"

Stage 0 — Component Selection:
Scanning component library... No physical teaching tool component needed for this topic.
Fraction comparison is best served by custom-generated visual models (bar/pie).

Stage 1 — Knowledge Analysis & Activity Design:
Target: CCSS.MATH.CONTENT.3.NF.A.3.D (Compare fractions with unlike denominators)
Age group: 8-9 years (Piaget's concrete operational stage)

Key findings:
1. Research (Cramer et al., 2002) shows bar/area models most effective at this level
2. Common misconception: whole-number reasoning applied to fractions (1/8 > 1/4 because 8 > 4)
3. Dual representation recommended: fraction bars + number line

Pedagogical approach: Cognitive Conflict — present misconception explicitly, let students disprove through manipulation.

Designing 3 progressive activities:
• Activity 1: Free exploration with adjustable fraction bars (slider interaction)
• Activity 2: Guided comparison practice with immediate feedback (click interaction)
• Activity 3: Timed number line challenge for fluency building (drag-sort interaction)

Component selection: None required (custom visual generation)
Activity structure validated against learning progression framework.`,

  design: `Generating visual designs and assets for 3 activities + home page...

Phase 1 — UI Mockup Generation:
Generating home page design... ✓
Generating Activity 1 (Exploration) design... ✓
Generating Activity 2 (Practice) design... ✓
Generating Activity 3 (Challenge) design... ✓

Phase 2 — Asset Planning:
Analyzing each activity's visual requirements from mockups...
Activity 1: 1 background + 2 interactive elements (fraction bars)
Activity 2: 1 background + 2 static elements (mascot, star)
Activity 3: 1 background + 3 static elements (timer, trophy, confetti)

Phase 3 — Asset Generation:
Processing backgrounds (remove white bg, crop, upload)...
Processing interactive elements...
Processing static decorative elements...

All 10 assets generated and uploaded to CDN.
Design images and asset prompts available for review in the Design/Assets panel.`,

  engineer: `Generating interactive HTML application with 3 activity pages...

Loading activity framework template (TeachingGameEngine + ActivityManager)
Injecting activity designs into code generation context...

Generating home page code...
• Title card with 3 activity entry buttons
• Animated background with gradient
✓ Home page complete

Generating Activity 1 — Fraction Exploration...
• Canvas-based fraction bar renderer with partition animation
• Dual slider controls (numerator/denominator) per fraction
• Real-time visual comparison indicator
• Bar model ↔ Pie model toggle
✓ Activity 1 complete

Generating Activity 2 — Comparison Practice...
• Question generator with 10 progressive pairs
• Prediction buttons (>, <, =) with feedback animation
• Score tracking with encouraging messages
• Misconception detection and hint system
✓ Activity 2 complete

Generating Activity 3 — Number Line Challenge...
• Draggable fraction cards with snap-to-position
• Accuracy scoring with visual feedback
• 60-second countdown timer
• Bonus round for equivalent fractions
✓ Activity 3 complete

Assembling index.html... ✓
Injecting component scripts... N/A (no external components)
Deploying to CDN...
✓ Deployment complete. Preview ready.`,

  test: `Running automated verification on all 3 activities...

[Activity 1 — Fraction Exploration]
Launching headless Chrome... ✓
Navigating to Activity 1... ✓
Capturing screenshot... ✓
Checking: return_button ✓ | activity_title ✓ | core_content ✓ | question_nav ✓ | console_errors ✓
Result: PASSED (5/5)

[Activity 2 — Comparison Practice]
Launching headless Chrome... ✓
Navigating to Activity 2... ✓
Capturing screenshot... ✓
Checking: return_button ✓ | activity_title ✓ | core_content ✓ | question_nav ✗ | console_errors ✓
Result: FAILED (4/5) — question navigation selector mismatch

Auto-fixing Activity 2...
Issue: addEventListener binding to ".nav-btn" but DOM uses ".question-nav button"
Fix applied: Updated selector in question navigation handler
Re-verifying... ✓ PASSED (5/5)

[Activity 3 — Number Line Challenge]
Launching headless Chrome... ✓
Navigating to Activity 3... ✓
Capturing screenshot... ✓
Checking: return_button ✓ | activity_title ✓ | core_content ✓ | question_nav ✓ | console_errors ✓
Result: PASSED (5/5)

Final results: 3/3 activities passing
Selecting best versions and re-assembling final HTML...
✓ Final deployment complete.`,
}
