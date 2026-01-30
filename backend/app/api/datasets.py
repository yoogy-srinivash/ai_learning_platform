import os
import uuid
import pandas as pd

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.dataset import Dataset
from app.models.user import User
from app.api.schemas.dataset import DatasetOut

UPLOAD_DIR = "uploads"

router = APIRouter(prefix="/datasets", tags=["datasets"])

def profile_dataframe(df: pd.DataFrame) -> dict:
    return {
        "columns": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_values": df.isnull().sum().to_dict(),
        "summary": df.describe(include="all").to_dict(),
        "sample": df.head(5).to_dict(orient="records"),
    }

@router.post("/upload", response_model=DatasetOut)
def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    try:
        df = pd.read_csv(file_path)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file")

    profile = profile_dataframe(df)

    dataset = Dataset(
        user_id=current_user.id,
        name=file.filename,
        file_path=file_path,
        rows=df.shape[0],
        cols=df.shape[1],
        profile=profile,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset 

@router.get("", response_model=list[DatasetOut])
def list_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Dataset)
        .filter(Dataset.user_id == current_user.id)
        .order_by(Dataset.created_at.desc())
        .all()
    )


@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dataset = (
        db.query(Dataset)
        .filter(
            Dataset.id == dataset_id,
            Dataset.user_id == current_user.id,
        )
        .first()
    )

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Delete file from filesystem
    if os.path.exists(dataset.file_path):
        os.remove(dataset.file_path)

    # Delete from database
    db.delete(dataset)
    db.commit()

    return {"message": "Dataset deleted successfully"}
