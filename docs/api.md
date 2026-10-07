# MedRisk AI — REST API Documentation

Base URL: `/api` (or `http://localhost:3000/api`)

### Endpoints

#### 1. System Health
- **Endpoint**: `GET /api/health`
- **Description**: Returns server status, model readiness, and dataset metadata.
- **Response**:
```json
{
  "status": "healthy",
  "service": "MedRisk AI Platform",
  "timestamp": "2026-08-25T09:20:00.000Z",
  "dataset": "UCI Diabetes 130-US Hospitals (1999-2008)"
}
```

#### 2. Risk Prediction & SHAP Explainability
- **Endpoint**: `POST /api/predict`
- **Request Body**:
```json
{
  "age_group": "[70-80)",
  "gender": "Male",
  "admission_type": "Emergency",
  "discharge_disposition": "Discharged/transferred to SNF",
  "admission_source": "Emergency Room",
  "time_in_hospital": 8,
  "num_lab_procedures": 65,
  "num_procedures": 2,
  "num_medications": 22,
  "number_outpatient": 1,
  "number_emergency": 2,
  "number_inpatient": 3,
  "number_diagnoses": 9,
  "primary_diagnosis": "Circulatory",
  "secondary_diagnosis": "Diabetes",
  "max_glu_serum": ">200",
  "A1Cresult": ">8",
  "change_in_meds": "Ch",
  "diabetes_med": "Yes",
  "insulin_treatment": "Up"
}
```
- **Response**: Returns `risk_probability`, `risk_score` (0-100), `risk_category` ("LOW" | "MEDIUM" | "HIGH"), `confidence_interval`, and full `shap_contributions` array.

#### 3. Prediction History
- **Endpoint**: `GET /api/predictions`
- **Headers**: `Authorization: Bearer <JWT>` (optional for guest records)
- **Response**: List of prior prediction snapshots.

#### 4. Anonymous Research Statistics
- **Endpoint**: `GET /api/dashboard/stats`
- **Response**: Aggregate statistics, distribution breakdown, and demographic risk correlations.

#### 5. Model Metrics
- **Endpoint**: `GET /api/model/metrics`
- **Response**: Verified 4-model evaluation metrics (ROC-AUC, Precision-Recall curves, Confusion Matrices, Brier scores).
