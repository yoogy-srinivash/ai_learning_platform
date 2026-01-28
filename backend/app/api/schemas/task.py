from pydantic import BaseModel
from typing import Optional, Any
from enum import Enum


class TaskType(str, Enum):
    lesson = "lesson"
    quiz = "quiz"
    project = "project"


class TaskBase(BaseModel):
    title: str
    type: TaskType
    content_json: Optional[Any] = None
    points: int = 0


class TaskCreate(TaskBase):
    module_id: int


class TaskRead(TaskBase):
    id: int
    module_id: int

    class Config:
        from_attributes = True
