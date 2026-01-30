from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.datasets import router as datasets_router
from app.api.roadmaps import router as roadmaps_router
from app.api.modules import router as modules_router
from app.api.tasks import router as tasks_router
from app.api.progress import router as progress_router
from app.api.dashboard import router as dashboard_router
from app.api.continue_learning import router as continue_router
from app.api.roadmap_next import router as roadmap_next_router

app = FastAPI(
    title="AI Learning Platform",
    version="0.1.0",
)

# ✅ CORS (THIS WAS MISSING)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(datasets_router)
app.include_router(roadmaps_router)
app.include_router(modules_router)
app.include_router(tasks_router)
app.include_router(progress_router)
app.include_router(dashboard_router)
app.include_router(continue_router)
app.include_router(roadmap_next_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
