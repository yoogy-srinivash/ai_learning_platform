from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, JSON, String, Text
from app.db.base import Base
import enum

class RunStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    done = "done"
    failed = "failed"

class Run(Base):
    __tablename__ = "runs"

    id = Column(Integer, primary_key=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False)
    status = Column(Enum(RunStatus), default=RunStatus.queued, nullable=False)
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    metrics = Column(JSON)
    artifacts_path = Column(String(500))
    logs = Column(Text)
