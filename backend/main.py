import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from config import settings
from database.connection import init_db
from auth.router import router as auth_router
from files.router import router as files_router
from engines.document.router import router as document_router
from engines.media.router import router as media_router
from engines.identity.router import router as identity_router
from engines.source.router import router as source_router
from engines.trust_graph.router import router as graph_router
from engines.risk.router import router as risk_router
from verification.router import router as verification_router
from admin.router import router as admin_router
from websocket.manager import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    await init_db()
    yield


app = FastAPI(
    title="BEYONDPROOF API",
    description="The Universal Digital Trust & Forensic Verification Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration — permissive for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Static files for uploads and generated assets
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(document_router)
app.include_router(media_router)
app.include_router(identity_router)
app.include_router(source_router)
app.include_router(graph_router)
app.include_router(risk_router)
app.include_router(verification_router)
app.include_router(admin_router)
app.include_router(ws_router)


@app.get("/api/health")
async def health_check():
    """Service health monitoring endpoint."""
    return {"status": "healthy", "service": "BEYONDPROOF API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
