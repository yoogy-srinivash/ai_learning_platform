from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
from enum import Enum


class ExperimentType(str, Enum):
    ml = "ml"
    dl = "dl"
    nlp = "nlp"


class ExperimentCreate(BaseModel):
    name: str
    dataset_id: int
    experiment_type: ExperimentType
    config: Dict[str, Any]


class ExperimentResponse(BaseModel):
    id: int
    name: str
    dataset_id: int
    experiment_type: ExperimentType
    config: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
