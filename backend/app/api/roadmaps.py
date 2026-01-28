from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.roadmap import Roadmap
from app.models.module import Module
from app.models.task import Task
from app.models.user import User
from app.models.user_progress import UserProgress
from app.api.schemas.roadmap import RoadmapRead

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])


# -------------------------
# Existing endpoints
# -------------------------

@router.get("", response_model=List[RoadmapRead])
def list_roadmaps(db: Session = Depends(get_db)):
    roadmaps = db.query(Roadmap).order_by(Roadmap.id).all()
    return roadmaps


@router.get("/{roadmap_id}", response_model=RoadmapRead)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


# -------------------------
# NEW: Roadmap completion %
# -------------------------

@router.get("/{roadmap_id}/progress")
def roadmap_progress(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1️⃣ Validate roadmap
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # 2️⃣ Total tasks in roadmap
    total_tasks = (
        db.query(func.count(Task.id))
        .join(Module, Module.id == Task.module_id)
        .filter(Module.roadmap_id == roadmap_id)
        .scalar()
    )

    if total_tasks == 0:
        return {
            "roadmap_id": roadmap_id,
            "total_tasks": 0,
            "completed_tasks": 0,
            "completion_percentage": 0,
        }

    # 3️⃣ Completed tasks by current user
    completed_tasks = (
        db.query(func.count(UserProgress.id))
        .join(Task, Task.id == UserProgress.task_id)
        .join(Module, Module.id == Task.module_id)
        .filter(
            Module.roadmap_id == roadmap_id,
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .scalar()
    )

    completion_percentage = round(
        (completed_tasks / total_tasks) * 100,
        2,
    )

    return {
        "roadmap_id": roadmap_id,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_percentage": completion_percentage,
    }
