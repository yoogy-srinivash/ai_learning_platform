from sqlalchemy import Column, Integer, String, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class TaskType(str, enum.Enum):
    lesson = "lesson"
    quiz = "quiz"
    project = "project"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)

    type = Column(Enum(TaskType), nullable=False)
    title = Column(String(255), nullable=False)

    content_json = Column(JSON, nullable=True)
    points = Column(Integer, default=0)

    # relationships
    module = relationship("Module", back_populates="tasks")

    progress = relationship(
        "UserProgress",
        back_populates="task",
        cascade="all, delete-orphan",
    )
