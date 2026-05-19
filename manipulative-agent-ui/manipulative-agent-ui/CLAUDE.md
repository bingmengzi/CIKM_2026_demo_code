# ManipulativeAgent — 项目上下文

## 项目概述

ManipulativeAgent 是一个多智能体协作教育内容生成系统的前端演示原型 + 后端服务。用于 CIKM Demo Track 论文投稿。系统通过4个AI Agent协作，从自然语言描述自动生成小学数学交互式虚拟教具（HTML应用）。

## 论文叙事 vs 实际架构

论文包装为4个Agent，实际对应8个Stage的pipeline：

| Agent (论文) | 实际Stage | 产出 | HITL |
|---|---|---|---|
| Agent_sci (Learning Science) | Stage 0+1 | 组件选择 + 3活动设计方案 | ✓ |
| Agent_des (Instructional Design) | Stage 2+3+4 | UI设计图(4张) + 素材图片 | ✓ |
| Agent_eng (Engineering) | Stage 5+6+7 | HTML代码 + 部署URL | ✓ |
| Agent_test (Testing) | Stage 8 | Selenium截图验证 + 自动修复 | 无 |

## 技术栈

### 前端
- React 19 + Vite + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- react-resizable-panels（三栏布局，API: `Group`, `Panel`, `Separator`）
- lucide-react（图标）
- framer-motion（动画）
- react-diff-viewer-continued（代码Diff）
- @codesandbox/sandpack-react（备用，目前Preview用iframe）

### 后端
- FastAPI + uvicorn
- SSE (sse-starlette) 实时推送Agent状态
- zxl_tal_llm（LLM调用：`chat`, `chat_stream`, `message_set`）
- zxl_upload（文件上传：`upload_file`, `upload_folder`）
- 图片生成：直接HTTP调用 `http://ai-service.tal.com/openai-compatible/v1/chat/completions`，model=`gemini-3.1-flash-image`，需要 `modalities: ["text", "image"]`
- API Key 存放在 `/mnt/pfs/zitao_team/zengxiaoli/.tal_image_key`（不要读取此文件）

## 目录结构

```
manipulative-agent-ui/
├── src/                          # 前端
│   ├── App.tsx                   # 根组件（OrchestrationProvider）
│   ├── components/
│   │   ├── layout/              # ThreePanelLayout, LeftSidebar, CenterWorkspace, RightPreview
│   │   ├── agents/              # AgentCard, AgentTimeline, ReviewPanel, InputBar, etc.
│   │   ├── preview/             # DesignTab, AssetsTab, PreviewTab, VerifyTab
│   │   └── code/                # CodeDiffViewer, CodeIterationTabs
│   ├── hooks/
│   │   ├── useAgentOrchestration.ts  # 核心状态管理（SSE连接后端）
│   │   └── useStreamingText.ts       # 打字机效果（仅mock模式用）
│   ├── mock/                    # Mock数据（当后端不可用时的fallback）
│   └── types/index.ts           # 类型定义
├── server/                       # 后端
│   ├── main.py                   # FastAPI app
│   ├── config.py                 # 配置（模型名、路径）
│   ├── models.py                 # Pydantic schemas
│   ├── session.py                # Session内存存储 + asyncio.Event控制HITL
│   ├── sse.py                    # emit() / emit_thinking() 工具函数
│   ├── routes/                   # API路由
│   │   ├── generate.py           # POST /api/generate
│   │   ├── stream.py             # GET /api/stream/{session_id} (SSE)
│   │   ├── hitl.py               # POST /api/approve, /api/feedback
│   │   └── assets.py             # POST /api/regenerate-image
│   ├── pipeline/                 # Agent实现
│   │   ├── orchestrator.py       # 主编排（顺序执行4个agent，checkpoint暂停）
│   │   ├── agent_science.py      # 组件选择 + 活动设计
│   │   ├── agent_design.py       # 设计图 + 素材（并发生成）
│   │   ├── agent_engineer.py     # 代码生成（并发4路） + 部署
│   │   └── agent_test.py         # Selenium验证（并发3路）
│   ├── services/                 # 底层服务封装
│   │   ├── llm_service.py        # async包装 zxl_tal_llm
│   │   ├── image_service.py      # 图片生成API调用 + 上传
│   │   ├── upload_service.py     # async包装 zxl_upload
│   │   └── selenium_service.py   # 无头Chrome截图验证
│   └── prompts/                  # 所有prompt模板（英文）
│       ├── science.py, design.py, engineer.py, test.py
└── vite.config.ts                # 含 proxy: '/api' -> localhost:8000
```

## 启动方式

```bash
# 终端1: 后端
cd manipulative-agent-ui && uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload

# 终端2: 前端
cd manipulative-agent-ui && npm run dev -- --host 0.0.0.0
```

## API协议

- `POST /api/generate` → `{session_id}`
- `GET /api/stream/{id}` → SSE事件流（agent_start, agent_thinking, checkpoint, agent_done, image_ready, asset_ready, preview_ready, verify_result, complete）
- `POST /api/approve/{id}` → 恢复pipeline
- `POST /api/feedback/{id}` → 带反馈恢复
- `POST /api/regenerate-image/{id}` → 单图重生成

## 已知问题 & TODO

1. **VerificationStatus组件** — 已改为从后端真实数据渲染，但Selenium验证经常失败（URL部署后需要几秒生效）
2. **ActivityPlanCard** — 仍使用mock数据，需改为从SSE `agent_output` 事件获取
3. **Code Diff** — 目前前端的CenterWorkspace只显示Agent Thinking，Code Diff tab被移除了，需要重新加回来展示代码迭代
4. **HTML框架模板** — agent_engineer在组装时注入了patch脚本来渲染template到page div
5. **react-resizable-panels** — v4 API用 `Group/Panel/Separator`，不是 `PanelGroup/PanelResizeHandle`；有 `min-width: 0px` 的CSS问题需要用 `[id^="_r_"] { min-width: auto !important; }` 覆盖
6. **前端PreviewTab** — 只有后端推送 `preview_ready` 后才显示iframe，无fallback URL

## 关键设计决策

- 前端使用 EventSource (SSE) 连接后端，不是 WebSocket
- HITL通过 `asyncio.Event` 实现：pipeline `await event.wait()` 暂停，前端调approve/feedback后 `event.set()` 恢复
- 图片生成、代码生成、验证都是并发的（`asyncio.gather`）
- 所有prompt和UI文本用英文（面向CIKM国际会议）
- 原始后端pipeline在 `/mnt/pfs/zitao_team/zengxiaoli/game_generation/code-0106/teaching_html/` 可参考但不直接复用
