"""ManipulativeAgent Backend — FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes import generate, stream, hitl, assets

app = FastAPI(
    title="ManipulativeAgent API",
    description="Multi-agent educational content generation backend",
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(generate.router)
app.include_router(stream.router)
app.include_router(hitl.router)
app.include_router(assets.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
