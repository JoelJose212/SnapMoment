from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from pathlib import Path

from app.config import settings
from app.database import init_db
from app.routers import auth, events, photos, guest, admin, analytics, onboarding


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create upload dir
    Path(settings.LOCAL_STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    # Init DB tables
    await init_db()
    yield


app = FastAPI(
    title="SnapMoment API",
    description="AI-driven event photo sharing platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
uploads_path = Path(settings.LOCAL_STORAGE_PATH)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(photos.router)
app.include_router(guest.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(onboarding.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "SnapMoment API"}
