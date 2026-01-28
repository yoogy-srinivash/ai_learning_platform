from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.roadmap import Roadmap
from app.models.module import Module
from app.models.task import Task
from app.models.user_progress import UserProgress

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def user_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -------------------------
    # GLOBAL COUNTS
    # -------------------------

    total_roadmaps = db.query(func.count(Roadmap.id)).scalar()
    total_modules = db.query(func.count(Module.id)).scalar()
    total_tasks = db.query(func.count(Task.id)).scalar()

    completed_tasks = (
        db.query(func.count(UserProgress.id))
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(True),
        )
        .scalar()
    )

    overall_completion = (
        round((completed_tasks / total_tasks) * 100, 2)
        if total_tasks > 0
        else 0
    )

    # -------------------------
    # ROADMAP-WISE PROGRESS
    # -------------------------

    roadmaps = db.query(Roadmap).order_by(Roadmap.id).all()
    roadmap_progress = []

    for roadmap in roadmaps:
        roadmap_total_tasks = (
            db.query(func.count(Task.id))
            .join(Module, Module.id == Task.module_id)
            .filter(Module.roadmap_id == roadmap.id)
            .scalar()
        )

        roadmap_completed_tasks = (
            db.query(func.count(UserProgress.id))
            .join(Task, Task.id == UserProgress.task_id)
            .join(Module, Module.id == Task.module_id)
            .filter(
                Module.roadmap_id == roadmap.id,
                UserProgress.user_id == current_user.id,
                UserProgress.completed.is_(True),
            )
            .scalar()
        )

        completion_percentage = (
            round(
                (roadmap_completed_tasks / roadmap_total_tasks) * 100,
                2,
            )
            if roadmap_total_tasks > 0
            else 0
        )

        roadmap_progress.append(
            {
                "roadmap_id": roadmap.id,
                "title": roadmap.title,
                "total_tasks": roadmap_total_tasks,
                "completed_tasks": roadmap_completed_tasks,
                "completion_percentage": completion_percentage,
            }
        )

    # -------------------------
    # FINAL RESPONSE
    # -------------------------

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
        },
        "summary": {
            "total_roadmaps": total_roadmaps,
            "total_modules": total_modules,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overall_completion_percentage": overall_completion,
        },
        "roadmaps": roadmap_progress,
    }
