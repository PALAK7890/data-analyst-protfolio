"""
PatternPilot AI — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from database import init_db
from routes import analyze, hints, review, tests, execution, progress, chat, roadmap


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="PatternPilot AI API",
    description="AI-powered DSA mentor backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow frontend dev server (Next.js :3000 and Vite :5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(analyze.router, tags=["Analyze"])
app.include_router(hints.router, tags=["Hints"])
app.include_router(review.router, tags=["Review"])
app.include_router(tests.router, tags=["Tests"])
app.include_router(execution.router, tags=["Execution"])
app.include_router(progress.router, tags=["Progress"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(roadmap.router, tags=["Roadmap"])


@app.get("/health", tags=["Health"])
async def health():
    return JSONResponse({"status": "ok", "message": "PatternPilot AI backend is running"})


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": "PatternPilot AI", "version": "1.0.0"}
