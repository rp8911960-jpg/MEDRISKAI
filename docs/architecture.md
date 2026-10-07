# MedRisk AI — System Architecture & Implementation

MedRisk AI is an Explainable AI (XAI) clinical decision-support system designed to predict 30-day all-cause hospital readmission risk for diabetic inpatient admissions using the UCI 130-US Hospitals dataset.

```
+-----------------------------------------------------------------------------------+
|                                  USER CLIENT                                      |
|   React 19 + TypeScript + Vite + Tailwind CSS + Recharts + Lucide + Motion UI     |
+----------------------------------------+------------------------------------------+
                                         |
                                         | REST / JSON (Secure HTTPS)
                                         v
+-----------------------------------------------------------------------------------+
|                            FULL-STACK BACKEND GATEWAY                             |
|        Node.js / Express Service (Port 3000) & FastAPI Python Application         |
|   - Request validation (Pydantic / Zod / Schemas)                                 |
|   - Authentication (JWT + BCrypt hashing + Role-Based Access)                     |
|   - Predictive Inference Router (/api/predict)                                    |
|   - Explainability Engine (/api/explain)                                          |
|   - Anonymous Research Analytics Aggregator (/api/dashboard/stats)                |
+----------------------------------------+------------------------------------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
+-----------------------------+                     +-----------------------------+
|    MACHINE LEARNING CORE    |                     |   EXPLAINABLE AI ENGINE     |
| - XGBoost (Selected Best)   |                     | - Exact TreeSHAP Engine     |
| - Random Forest Classifier  |                     | - Linear SHAP Log-Odds      |
| - Regularized Logistic Reg  |                     | - Base Value E[f(x)]        |
| - RBF Support Vector Machine|                     | - Local Attribution phi_i   |
| - Platt Scaling Calibrator  |                     | - Clinical Driver Ranking   |
+-----------------------------+                     +-----------------------------+
               |                                                   |
               +-------------------------+-------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                              DATA & STORAGE LAYER                                 |
|   - UCI Diabetes 130-US Hospitals (101,766 Encounters / 55 Clinical Attributes)   |
|   - PostgreSQL (Production) / SQLite / Secure In-Memory Store                     |
|   - Model Artifacts (best_model.pkl, preprocessing_pipeline.pkl, metrics.json)    |
+-----------------------------------------------------------------------------------+
```

## Security & Ethics
1. **Zero Real-Patient Identifiers (PHI)**: The system accepts anonymous clinical parameters only (e.g., age bracket, lab counts, medication titrations) and strictly prohibits entering PII (Names, SSN, MRN, phone numbers).
2. **Clinical Disclaimer**: Prominently presented on every prediction output: The tool is for research decision-support and educational analysis, not replacement for professional medical evaluation.
3. **Threshold Calibration**: Configurable sensitivity bounds for High, Medium, and Low risk stratification.
