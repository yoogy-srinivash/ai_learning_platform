# AI Learning Platform

An intelligent learning platform with personalized roadmaps, modules, tasks, progress tracking, and ML/DL/NLP experimentation.

## Project Status vs. Original Plan

### ✅ **COMPLETED (Month 1-2 Foundations)**

#### Authentication & Profiles
- ✅ User registration endpoint
- ✅ User login with JWT
- ✅ Password hashing (bcrypt + SHA256)
- ✅ Protected routes via JWT middleware
- ✅ `/auth/me` endpoint
- ❌ Role system (user/admin) - **NOT IMPLEMENTED**
- ❌ User profile fields (goal, preferred roadmap date) - **NOT IMPLEMENTED**

#### Roadmap + Tasks
- ✅ Roadmap CRUD (list, get)
- ✅ Modules per roadmap with month_number
- ✅ Tasks with types (lesson, quiz, project)
- ✅ Task content storage (JSON)
- ✅ Task points system
- ✅ User progress tracking with uniqueness constraints
- ✅ Progress percentage calculations (task, module, roadmap level)
- ✅ Smart continue learning with fallback logic
- ✅ Module-level next task endpoint

#### Dataset Hub
- ✅ CSV upload validation
- ✅ DataFrame profiling (columns, missing values, summary stats)
- ✅ Dataset metadata (rows, cols, created_at)
- ✅ User-owned datasets
- ✅ List & delete datasets
- ❌ Data visualizations (histograms, bar charts, correlations) - **NOT IMPLEMENTED**
- ❌ Advanced profiling endpoint - **NOT IMPLEMENTED**

#### Database & Infrastructure
- ✅ Alembic migrations (6 migrations)
- ✅ Core schema: users, roadmaps, modules, tasks, user_progress, datasets
- ✅ CORS middleware
- ✅ Health check endpoint
- ✅ Dependency injection for auth & DB

---

### ❌ **NOT YET IMPLEMENTED**

#### Experiment System (Core feature - Month 2-4)
- ❌ Experiment model (experiment_type, config_json)
- ❌ Experiment CRUD endpoints
- ❌ Runs model (with status, metrics, artifacts)
- ❌ Run storage & tracking
- ❌ Job queue system (Celery/RQ/Redis)
- ❌ Experiment configuration endpoint
- ❌ Run submission/enqueue endpoint
- ❌ Run details retrieval
- ❌ Run history listing

#### ML/DL/NLP Training (Month 2-4)
- ❌ Worker service setup
- ❌ Sklearn model implementations:
  - ❌ Logistic Regression
  - ❌ Linear Regression
  - ❌ Decision Tree
  - ❌ KMeans
- ❌ Metrics computation (accuracy, precision, recall, F1, RMSE)
- ❌ PyTorch training service
- ❌ CNN (MNIST/Fashion-MNIST)
- ❌ Hugging Face transformers integration
- ❌ Sentiment classification pipeline
- ❌ DistilBERT fine-tuning

#### Charts & Visualizations
- ❌ Confusion matrix generation
- ❌ ROC curve generation
- ❌ Loss curves (DL training)
- ❌ Histograms for dataset profiling
- ❌ Correlation matrices
- ❌ Charts API endpoints

#### AI Mentor Chat (Month 4)
- ❌ Mentor chat endpoint (`POST /mentor/chat`)
- ❌ Chat message storage
- ❌ Response generation (rule-based or LLM)
- ❌ Integration with run metrics
- ❌ Feedback logic (overfitting detection, hyperparameter suggestions)
- ❌ Dataset summary context

#### Project Portfolio Page (Bonus)
- ❌ Portfolio model/schema
- ❌ Portfolio generation endpoint
- ❌ Shareable portfolio page
- ❌ Best runs aggregation
- ❌ GitHub link integration

#### C Module: faststats (Integration)
- ❌ C implementation (mean, std, min, max, histogram bins)
- ❌ Python binding via ctypes/Cython
- ❌ Integration into dataset profiling
- ❌ Build script

#### Frontend (UI/UX)
- ✅ Auth pages (login, register)
- ✅ Dashboard (basic stats)
- ✅ Roadmap page
- ✅ Module listing
- ✅ Navbar
- ✅ Continue learning page
- ❌ Experiment builder page
- ❌ Dataset visualization page (charts & profiling)
- ❌ Run details page (metrics, charts, confusion matrix)
- ❌ Mentor chat panel/modal
- ❌ Portfolio page
- ❌ Hyperparameter configuration UI

#### Testing & CI/CD
- ❌ Unit tests
- ❌ Integration tests
- ❌ GitHub Actions CI pipeline
- ❌ Lint checks

#### Deployment & DevOps
- ✅ Docker setup
- ✅ docker-compose.yml skeleton
- ❌ Production environment config
- ❌ S3/MinIO integration (file storage)
- ❌ Redis setup (if using Celery)

---

## Completion Status

### Overall Progress: **~30-35% Complete**

**Breakdown by area:**
- Auth & Profiles: **60%** (missing role system, user profile fields)
- Roadmap & Tasks: **100%** ✅
- Dataset Hub: **50%** (missing visualizations)
- Experiment System: **0%** ❌
- ML/DL/NLP Training: **0%** ❌
- Charts & Visualizations: **0%** ❌
- AI Mentor Chat: **0%** ❌
- Portfolio: **0%** ❌
- C Module: **0%** ❌
- Frontend UI: **50%** (auth, dashboard, roadmap pages only)
- Testing & CI: **0%** ❌

---

## What Needs to Be Done (Priority Order)

### **Phase 1: Experiment Infrastructure** (High Priority)
1. Create `Experiment` and `Run` models
2. Set up Celery + Redis for job queue
3. Build worker service scaffold
4. Implement run submission endpoint
5. Build run details/history endpoints

### **Phase 2: ML Training Pipeline** (High Priority)
1. Implement sklearn models (logistic regression, linear regression, decision tree, kmeans)
2. Add metrics computation
3. Create training worker jobs
4. Save metrics to runs table
5. Build run results display in frontend

### **Phase 3: Frontend Experiment Pages** (High Priority)
1. Experiment builder page (dataset selection, algorithm choice, hyperparams)
2. Run details page (metrics cards, tables)
3. Charts generation & display

### **Phase 4: DL & NLP** (Medium Priority)
1. PyTorch training service
2. CNN implementation for MNIST
3. Hugging Face integration
4. Sentiment classification

### **Phase 5: AI Mentor** (Medium Priority)
1. Mentor chat endpoint
2. Response generation logic
3. Frontend chat UI

### **Phase 6: Advanced Features** (Lower Priority)
1. Portfolio page
2. C module (faststats)
3. Data visualizations
4. Testing & CI/CD

---

## Tech Stack (Current vs. Required)

### Installed ✅
- FastAPI
- SQLAlchemy
- JWT/bcrypt
- Pandas
- MySQL
- Next.js (frontend)
- Docker

### Still Needed ❌
- **Celery** (job queue)
- **Redis** (broker)
- **PyTorch** (DL)
- **Hugging Face Transformers** (NLP)
- **Plotly/Matplotlib** (chart generation)
- **pytest** (testing)

---

## Key Files to Create/Modify

```
Backend:
- app/models/experiment.py (NEW)
- app/models/run.py (NEW)
- app/api/experiments.py (NEW)
- app/api/mentor.py (ENHANCED - only has model, no endpoints)
- app/worker/ (NEW - Celery worker setup)
- migrations/ (NEW - experiment & run tables)

Frontend:
- app/experiment-builder/ (NEW)
- app/run/[runId]/ (NEW)
- app/mentor/ (NEW)
- components/ExperimentBuilder.tsx (NEW)
- components/ChartDisplay.tsx (NEW)

C Module:
- c_modules/faststats/ (SCAFFOLD)
- c_modules/build.sh (NEW)
```

---

## Estimated Timeline to Completion

- **Phase 1 (Experiments):** 2-3 weeks
- **Phase 2 (ML):** 2-3 weeks
- **Phase 3 (Frontend):** 2-3 weeks
- **Phase 4 (DL/NLP):** 2-3 weeks
- **Phase 5 (Mentor):** 1-2 weeks
- **Phase 6 (Advanced):** 2-3 weeks

**Total: ~12-17 weeks** to reach 100% of plan