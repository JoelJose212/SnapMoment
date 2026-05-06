from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import os
from pathlib import Path

from app.config import settings
from app.database import init_db
from app.routers import auth, events, photos, guest, admin, analytics, onboarding, collaboration, booking, photographer, specialization, chat, shortlist, notification, client


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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"VALIDATION ERROR: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
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
app.include_router(collaboration.router)
app.include_router(booking.router)
app.include_router(photographer.router)
app.include_router(specialization.router)
app.include_router(chat.router)
app.include_router(shortlist.router)
app.include_router(notification.router)
app.include_router(client.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "SnapMoment API"}
