from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, JSON, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class ExperimentType(str, enum.Enum):
    ml = "ml"
    dl = "dl"
    nlp = "nlp"


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)

    name = Column(String(255), nullable=False)

    experiment_type = Column(Enum(ExperimentType), nullable=False)

    config = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    runs = relationship("Run", back_populates="experiment", cascade="all, delete")
