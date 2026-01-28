from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, exists

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.roadmap import Roadmap
from app.models.module import Module
from app.models.task import Task
from app.models.user_progress import UserProgress

router = APIRouter(prefix="/continue", tags=["continue-learning"])


@router.get("")
def continue_learning(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ------------------------------------
    # 1️⃣ Resume last started (not completed)
    # ------------------------------------
    last_progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed.is_(False),
        )
        .order_by(desc(UserProgress.id))
        .first()
    )

    if last_progress:
        task = db.query(Task).filter(Task.id == last_progress.task_id).first()
        module = db.query(Module).filter(Module.id == task.module_id).first()
        roadmap = db.query(Roadmap).filter(Roadmap.id == module.roadmap_id).first()

        return {
            "resume": True,
            "roadmap": {
                "id": roadmap.id,
                "title": roadmap.title,
            },
            "module": {
                "id": module.id,
                "month_number": module.month_number,
                "title": module.title,
            },
            "task": {
                "id": task.id,
                "type": task.type,
                "title": task.title,
                "content": task.content_json,
                "points": task.points,
            },
            "all_completed": False,
        }

    # ------------------------------------
    # 2️⃣ Fallback → first incomplete task
    # ------------------------------------
    roadmaps = db.query(Roadmap).order_by(Roadmap.id).all()

    for roadmap in roadmaps:
        modules = (
            db.query(Module)
            .filter(Module.roadmap_id == roadmap.id)
            .order_by(Module.month_number)
            .all()
        )

        for module in modules:
            tasks = (
                db.query(Task)
                .filter(Task.module_id == module.id)
                .order_by(Task.id)
                .all()
            )

            for task in tasks:
                completed = (
                    db.query(
                        exists().where(
                            UserProgress.user_id == current_user.id,
                            UserProgress.task_id == task.id,
                            UserProgress.completed.is_(True),
                        )
                    )
                    .scalar()
                )

                if not completed:
                    return {
                        "resume": False,
                        "roadmap": {
                            "id": roadmap.id,
                            "title": roadmap.title,
                        },
                        "module": {
                            "id": module.id,
                            "month_number": module.month_number,
                            "title": module.title,
                        },
                        "task": {
                            "id": task.id,
                            "type": task.type,
                            "title": task.title,
                            "content": task.content_json,
                            "points": task.points,
                        },
                        "all_completed": False,
                    }

    # ------------------------------------
    # 3️⃣ Everything done
    # ------------------------------------
    return {
        "all_completed": True,
        "message": "🎉 You have completed all available content!",
    }