from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict

class DatasetOut(BaseModel):
    id: int
    name: str
    rows: int | None
    cols: int | None
    profile: Dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True
