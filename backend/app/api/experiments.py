from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.schemas.experiment import ExperimentCreate, ExperimentResponse
from app.db.deps import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.experiment import Experiment
from app.models.run import Run, RunStatus
from app.models.dataset import Dataset

import pandas as pd
import numpy as np
from datetime import datetime

# ML imports
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    silhouette_score,
)

# =========================================
# Allowed Task Types & Algorithms
# =========================================

ALLOWED_TASK_TYPES = ["classification", "regression", "clustering"]

ALLOWED_ALGORITHMS = {
    "classification": ["logistic_regression"],
    "regression": ["linear_regression"],
    "clustering": ["kmeans"],
}

router = APIRouter(prefix="/experiments", tags=["experiments"])


# =========================================
# Create Experiment
# =========================================

@router.post("", response_model=ExperimentResponse)
def create_experiment(
    payload: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task_type = payload.config.get("task_type")
    algorithm = payload.config.get("algorithm")

    if task_type not in ALLOWED_TASK_TYPES:
        raise HTTPException(status_code=400, detail="Invalid task type")

    if algorithm not in ALLOWED_ALGORITHMS.get(task_type, []):
        raise HTTPException(status_code=400, detail="Invalid algorithm for task type")

    experiment = Experiment(
        user_id=current_user.id,
        dataset_id=payload.dataset_id,
        name=payload.name,
        experiment_type=payload.experiment_type,
        config=payload.config,
    )

    db.add(experiment)
    db.commit()
    db.refresh(experiment)

    return experiment


# =========================================
# Create Run
# =========================================

@router.post("/{experiment_id}/runs")
def create_run(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experiment = (
        db.query(Experiment)
        .filter(
            Experiment.id == experiment_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    dataset = db.query(Dataset).filter(
        Dataset.id == experiment.dataset_id
    ).first()

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    run = Run(
        experiment_id=experiment.id,
        status=RunStatus.running,
        started_at=datetime.utcnow(),
    )

    db.add(run)
    db.commit()
    db.refresh(run)

    try:
        df = pd.read_csv(dataset.file_path)

        task_type = experiment.config.get("task_type")
        algorithm = experiment.config.get("algorithm")

        # =====================================
        # CLASSIFICATION
        # =====================================
        if task_type == "classification":

            if df.shape[1] < 2:
                raise ValueError("Classification requires features + target column")

            X = df.iloc[:, :-1]
            y = df.iloc[:, -1]

            test_size = experiment.config.get("test_size", 0.2)

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

            if algorithm == "logistic_regression":
                model = LogisticRegression(max_iter=1000)
            else:
                raise ValueError("Unsupported algorithm")

            model.fit(X_train, y_train)
            predictions = model.predict(X_test)

            run.metrics = {
                "task_type": "classification",
                "accuracy": float(accuracy_score(y_test, predictions)),
                "precision": float(precision_score(y_test, predictions, average="weighted")),
                "recall": float(recall_score(y_test, predictions, average="weighted")),
                "f1_score": float(f1_score(y_test, predictions, average="weighted")),
                "confusion_matrix": confusion_matrix(y_test, predictions).tolist(),
                "train_size": len(X_train),
                "test_size": len(X_test),
            }

        # =====================================
        # REGRESSION
        # =====================================
        elif task_type == "regression":

            if df.shape[1] < 2:
                raise ValueError("Regression requires features + target column")

            X = df.iloc[:, :-1]
            y = df.iloc[:, -1]

            test_size = experiment.config.get("test_size", 0.2)

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

            if algorithm == "linear_regression":
                model = LinearRegression()
            else:
                raise ValueError("Unsupported algorithm")

            model.fit(X_train, y_train)
            predictions = model.predict(X_test)

            run.metrics = {
                "task_type": "regression",
                "rmse": float(np.sqrt(mean_squared_error(y_test, predictions))),
                "mae": float(mean_absolute_error(y_test, predictions)),
                "r2_score": float(r2_score(y_test, predictions)),
                "train_size": len(X_train),
                "test_size": len(X_test),
            }

        # =====================================
        # CLUSTERING
        # =====================================
        elif task_type == "clustering":

            X = df.select_dtypes(include=["number"])

            if X.shape[1] == 0:
                raise ValueError("Clustering requires numeric features")

            n_clusters = experiment.config.get("n_clusters", 3)

            if algorithm == "kmeans":
                model = KMeans(n_clusters=n_clusters, random_state=42)
            else:
                raise ValueError("Unsupported algorithm")

            labels = model.fit_predict(X)

            run.metrics = {
                "task_type": "clustering",
                "n_clusters": n_clusters,
                "inertia": float(model.inertia_),
                "silhouette_score": float(silhouette_score(X, labels)),
                "num_samples": len(X),
            }

        else:
            raise ValueError("Unsupported task type")

        run.status = RunStatus.done
        run.ended_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        run.status = RunStatus.failed
        run.ended_at = datetime.utcnow()
        run.logs = str(e)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}",
        )

    return {
        "id": run.id,
        "experiment_id": run.experiment_id,
        "status": run.status.value,
        "started_at": run.started_at,
        "ended_at": run.ended_at,
        "metrics": run.metrics,
        "logs": run.logs,
    }


# =========================================
# Get Experiment
# =========================================

@router.get("/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experiment = (
        db.query(Experiment)
        .filter(
            Experiment.id == experiment_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    return experiment


# =========================================
# List Runs
# =========================================

@router.get("/{experiment_id}/runs")
def list_runs(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experiment = (
        db.query(Experiment)
        .filter(
            Experiment.id == experiment_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")

    runs = (
        db.query(Run)
        .filter(Run.experiment_id == experiment_id)
        .order_by(Run.id.desc())
        .all()
    )

    return runs


# =========================================
# Get Single Run
# =========================================

@router.get("/runs/{run_id}")
def get_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = (
        db.query(Run)
        .join(Experiment)
        .filter(
            Run.id == run_id,
            Experiment.user_id == current_user.id,
        )
        .first()
    )

    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return run
