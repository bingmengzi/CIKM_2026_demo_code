# ManipulativeAgent — Multi-Agent Interactive Manipulative Generation System

A multi-agent collaborative system that automatically generates interactive HTML-based math manipulatives from natural language descriptions. Built for the CIKM 2026 Demo Track.

## System Architecture

The system implements a 4-agent pipeline with Human-in-the-Loop (HITL) checkpoints:

| Agent | Role | Output |
|-------|------|--------|
| **Learning Science Agent** | Analyzes learning objectives, selects components, designs 3 progressive activities | Activity plan (JSON) |
| **Instructional Design Agent** | Generates UI mockup images + asset images for each activity | Design images + asset images |
| **Engineering Agent** | Generates HTML/JS code for each activity, assembles and deploys | Deployed interactive HTML |
| **Testing Agent** | Automated Selenium verification with iterative fixing | Screenshot + check results |

Each agent (except Testing) pauses at a checkpoint for human review before proceeding.

## Tech Stack

**Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + react-resizable-panels

**Backend:** FastAPI + SSE (Server-Sent Events) + asyncio

**Services:** LLM (zxl_tal_llm), Image Generation (Gemini), File Upload (zxl_upload), Selenium (headless Chrome)

## Prerequisites

- Python 3.10+
- Node.js 18+
- Chrome + ChromeDriver (for Testing Agent)
- Access to internal LLM service (zxl_tal_llm)
- Access to image generation API (ai-service.tal.com)

## Installation

```bash
cd manipulative-agent-ui

# Frontend dependencies
npm install

# Backend dependencies
pip install fastapi uvicorn sse-starlette pydantic
# Internal packages: zxl_tal_llm, zxl_upload
```

## Running

### Start Backend

```bash
cd manipulative-agent-ui
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend

```bash
cd manipulative-agent-ui
npm run dev -- --host 0.0.0.0
```

The frontend dev server proxies `/api` requests to `localhost:8000`.

Open `http://localhost:5173` in your browser.

## Usage

1. Enter a natural language description of the desired manipulative in the input box (e.g., "Generate an interactive fraction comparison tool for Grade 3-4 students")
2. The system will sequentially run each agent:
   - **Science Agent** generates an activity plan -> Review and Approve/Feedback
   - **Design Agent** generates UI mockups and assets -> Review and Approve/Feedback
   - **Engineering Agent** generates code and deploys -> Preview in iframe -> Approve/Feedback
   - **Testing Agent** automatically verifies all activities via Selenium
3. The final deployed URL is shown upon completion

## Pipeline Cache (Replay Mode)

After a successful pipeline run, all intermediate outputs are automatically saved to `output/{session_id}/`. This can be used to replay a previous run without re-invoking LLMs or services, useful for demos and debugging.

### Saved Output Structure

```
output/{session_id}/
├── meta.json              # Session metadata (description, timestamp)
├── science_output.json    # Component info + activity plan
├── science_thinking.txt   # Agent thinking process text
├── design_output.json     # Design images + assets (URLs)
├── design_thinking.txt
├── engineer_output.json   # Deploy URL
├── engineer_thinking.txt
├── index.html             # Generated HTML file
├── test_output.json       # Verification results + full attempt history
└── test_thinking.txt
```

### Running with Cache

To use a cached pipeline run (skips all LLM/service calls, replays from saved data):

```bash
export PIPELINE_CACHE_DIR=output/a4244eec
uvicorn server.main:app --host 0.0.0.0 --port 8000
```

When `PIPELINE_CACHE_DIR` is set and points to a valid output directory, the backend replays the saved pipeline with simulated delays:
- Design image generation: ~30s (distributed across images)
- Code generation: ~15s
- Verification: ~5s per activity attempt

HITL checkpoints are preserved in replay mode -- the system still pauses for user approval at each stage.

To switch back to live mode, simply unset the variable or restart without it.

## Project Structure

```
manipulative-agent-ui/
├── src/                          # Frontend (React + TypeScript)
│   ├── App.tsx                   # Root component
│   ├── components/
│   │   ├── layout/              # ThreePanelLayout, LeftSidebar, CenterWorkspace, RightPreview
│   │   ├── agents/              # AgentCard, AgentTimeline, ReviewPanel, VerificationStatus
│   │   ├── preview/             # DesignTab, AssetsTab, PreviewTab, VerifyTab
│   │   └── code/                # CodeDiffViewer, CodeIterationTabs
│   ├── hooks/
│   │   └── useAgentOrchestration.ts  # Core state management (SSE connection)
│   ├── mock/                    # Static fallback data
│   └── types/index.ts
├── server/                       # Backend (FastAPI)
│   ├── main.py                   # App entry point
│   ├── config.py                 # Configuration (models, paths, limits)
│   ├── models.py                 # Pydantic request/response schemas
│   ├── session.py                # In-memory session store
│   ├── sse.py                    # SSE emission utilities
│   ├── routes/
│   │   ├── generate.py           # POST /api/generate
│   │   ├── stream.py            # GET /api/stream/{session_id} (SSE)
│   │   ├── hitl.py              # POST /api/approve, /api/feedback
│   │   └── assets.py            # POST /api/regenerate-image
│   ├── pipeline/
│   │   ├── orchestrator.py      # Main pipeline orchestration
│   │   ├── agent_science.py     # Learning Science Agent
│   │   ├── agent_design.py      # Instructional Design Agent
│   │   ├── agent_engineer.py    # Engineering Agent
│   │   ├── agent_test.py        # Testing Agent
│   │   └── replay.py           # Replay from cached output
│   ├── services/
│   │   ├── llm_service.py      # LLM API wrapper
│   │   ├── image_service.py    # Image generation API
│   │   ├── upload_service.py   # File upload wrapper
│   │   └── selenium_service.py # Headless Chrome verification
│   └── prompts/                 # Prompt templates
├── output/                       # Saved pipeline outputs (auto-generated)
├── vite.config.ts
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Start a new pipeline session |
| GET | `/api/stream/{session_id}` | SSE event stream |
| POST | `/api/approve/{session_id}` | Approve current checkpoint |
| POST | `/api/feedback/{session_id}` | Submit feedback at checkpoint |
| POST | `/api/regenerate-image/{session_id}` | Regenerate a single image |

## SSE Event Types

| Event | Description |
|-------|-------------|
| `agent_start` | Agent begins execution |
| `agent_thinking` | Streaming thinking text (delta) |
| `agent_output` | Structured output (e.g., activity plan) |
| `checkpoint` | Pipeline paused for human review |
| `agent_done` | Agent completed |
| `image_ready` | Design image generated |
| `asset_ready` | Asset image generated |
| `preview_ready` | HTML deployed, preview URL available |
| `verify_result` | Single activity verification result |
| `complete` | Pipeline finished |
| `error` | Pipeline error |

## Configuration

Key settings in `server/config.py`:

- `LLM_TASK_MAIN` / `LLM_TASK_CODE` / `LLM_TASK_VERIFY` -- LLM model task names
- `IMAGE_API_URL` -- Image generation endpoint
- `SELENIUM_CONFIG_PATH` -- Path to Chrome/ChromeDriver config
- `MAX_VERIFY_RETRIES` -- Max verification attempts per activity (default: 5)
- `MAX_CONCURRENT_IMAGES` -- Parallel image generation limit (default: 4)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PIPELINE_CACHE_DIR` | Path to cached output directory for replay mode | (empty, uses live pipeline) |

## License

For academic use only. CIKM 2026 Demo Track submission.
