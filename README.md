# MedRisk AI — Explainable 30-Day Hospital Readmission Risk Prediction System

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express%20%26%20Node.js-green.svg)](https://expressjs.com/)

**MedRisk AI** is an end-to-end Explainable Artificial Intelligence (XAI) clinical decision support platform designed to predict 30-day hospital readmission risk for diabetic and multi-comorbid inpatients. 

By integrating machine learning classifiers (XGBoost, Random Forest, Support Vector Machine, and Logistic Regression) with **TreeSHAP (Shapley Additive exPlanations)**, MedRisk AI transforms "black-box" risk scoring into transparent, clinically interpretable feature attributions and actionable transitional care checklists.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [Clinical & Economic Motivation](#-clinical--economic-motivation)
- [Dataset & Clinical Features](#-dataset--clinical-features)
- [Machine Learning & XAI Architecture](#-machine-learning--xai-architecture)
- [Core Features](#-core-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [REST API Reference](#-rest-api-reference)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Ethical AI & Clinical Disclaimer](#-ethical-ai--clinical-disclaimer)
- [Academic Citation](#-academic-citation)

---

## 🌟 Key Highlights

- **Predictive Risk Stratification**: Calibrated readmission probability (0–100%) with 95% confidence intervals and configurable clinical thresholds (Low `<30%`, Medium `30–70%`, High `>70%`).
- **Verifiable Local Explainability (TreeSHAP)**: Waterfall and directional attribution charts demonstrating exact positive ($+\phi_i$) and negative ($-\phi_i$) deviations from the population base rate ($E[f(x)] = 42.1\%$).
- **Interactive "What-If" Counterfactual Engine**: Real-time clinical intervention simulator allowing care teams to test adjustments (e.g., glycemic management, post-discharge home health, medication reconciliation) with instant $\Delta$ risk recalculation.
- **Academic Benchmark Lab**: Multi-model evaluation comparing XGBoost (AUC `0.781`), Random Forest (AUC `0.768`), SVM (AUC `0.749`), and Logistic Regression (AUC `0.728`) with interactive ROC curves and cost-matrix threshold tuning.
- **Clinical Decision Support (CDS) Reports**: Print-ready, high-resolution clinical summaries formatted with patient snapshots, top risk drivers, and targeted discharge checklists.
- **Privacy & Security by Design**: No Personally Identifiable Information (PII) or Protected Health Information (PHI) required or stored. Fully stateless evaluation pipeline.

---

## 🏥 Clinical & Economic Motivation

Under the **CMS Hospital Readmissions Reduction Program (HRRP)**, unplanned 30-day readmissions cost over **$17 billion annually** in the United States and trigger significant financial penalties for healthcare institutions. 

While state-of-the-art ensemble models achieve strong classification accuracy, clinical adoption has historically stalled due to the lack of interpretability. MedRisk AI bridges this gap by presenting clinicians with evidence-based explanations alongside each risk score.

---

## 📊 Dataset & Clinical Features

MedRisk AI is trained and validated on the **Diabetes 130-US Hospitals (1999–2008)** dataset from the **UCI Machine Learning Repository** (*Strack et al.*), representing **101,766 unique clinical encounters** across 130 medical centers.

### Input Clinical Variables:
- **Demographics & Admission**: Age category (`[0-10)` through `[90-100)`), Gender, Admission Type (Emergency, Urgent, Elective), Admission Source, Discharge Disposition.
- **Inpatient Utilization**: Length of stay (1–14 days), Prior Emergency visits, Inpatient admissions (past 12 months), Prior Outpatient visits.
- **Acuity & Complexity**: Number of diagnoses, Primary & Secondary ICD-9 categories (Circulatory, Respiratory, Endocrine, Diabetes, Digestive, Genitourinary, Musculoskeletal, Neoplasms, Injury), Total Lab procedures, Total Inpatient procedures, Number of distinct medications.
- **Glycemic & Medication Factors**: HbA1c measurement status (`None`, `Norm`, `>7`, `>8`), Serum Glucose (`None`, `Norm`, `>200`, `>300`), Insulin treatment regimen (`No`, `Steady`, `Up`, `Down`), Medication changes (`Ch`, `No`), Diabetes medication prescribed (`Yes`, `No`).

---

## 🧠 Machine Learning & XAI Architecture

### Evaluated Model Benchmarks (5-Fold Stratified Cross-Validation):

| Model Architecture | ROC-AUC | PR-AUC | Accuracy | Sensitivity (Recall) | Specificity | F1-Score | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Selected Best)** | **0.781** | **0.742** | **75.8%** | **77.4%** | **74.2%** | **0.745** | **0.178** |
| **Random Forest** | 0.768 | 0.725 | 74.2% | 75.3% | 73.1% | 0.726 | 0.185 |
| **Support Vector Machine (RBF)** | 0.749 | 0.701 | 72.5% | 73.1% | 71.9% | 0.705 | 0.198 |
| **Logistic Regression (L2 Baseline)** | 0.728 | 0.678 | 70.4% | 71.0% | 69.8% | 0.685 | 0.209 |

### Explainable AI Method:
$$\hat{f}(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$
Where $\phi_0 = 42.1\%$ represents the baseline expected value, and each $\phi_i$ is the exact marginal attribution calculated via TreeSHAP for feature $i$.

---

## 💻 Core Features

1. **Patient Assessment Hub (`/predict`)**:
   - Structured accordion input form for quick entry of clinical parameters.
   - Pre-loaded clinical archetype presets (High Risk Heart Failure Elderly, Moderate Risk Uncontrolled T2D, Low Risk Elective Patient).
   - Real-time input validation and multi-model selector.

2. **XAI Diagnostic Results (`/result`)**:
   - Interactive SVG Risk Speedometer with 95% Confidence Interval badge.
   - TreeSHAP Waterfall breakdown ranking top 5 positive and top negative contributors.
   - Natural language clinical synthesis explaining physiological drivers.
   - Tailored transitional care recommendations (e.g., 48-hour post-discharge tele-call, medication reconciliation, diabetic educator consultation).

3. **What-If Clinical Simulator**:
   - Dynamic parameter sliders to test the impact of modifying discharge disposition, glycemic control (HbA1c / glucose), medication regimens, and follow-up support.

4. **Population Health Dashboard (`/dashboard`)**:
   - Risk tier distribution charts across demographic cohorts.
   - ICD-9 primary diagnostic category breakdown.
   - Inpatient HbA1c testing impact analysis demonstrating readmission reductions associated with glycemic monitoring.

5. **Research & Model Lab (`/research`)**:
   - Comparative ROC curves, Precision-Recall curves, Confusion Matrices with custom decision thresholds ($\tau$), and algorithmic feature importance rankings.

6. **History & Audit Log (`/history`)**:
   - Session-persistent record of all evaluated encounters with CSV export.

---

## 🛠 System Architecture & Tech Stack

```
medrisk-ai/
├── src/
│   ├── components/          # Reusable UI & CDS components (Gauges, Charts, Disclaimers)
│   ├── pages/               # Application views (Home, Predict, Result, Research, etc.)
│   ├── lib/                 # Clinical constants, SHAP calculators & presets
│   ├── types.ts             # Strict TypeScript clinical interfaces
│   ├── App.tsx              # Core routing & application state management
│   └── main.tsx             # React DOM entry point
├── server.ts                # Express backend API & ML prediction engine
├── metadata.json            # Application configuration & permissions
├── package.json             # Build scripts & dependencies
└── README.md                # Project documentation
```

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas/SVG visualizers.
- **Backend & ML Layer**: Node.js, Express, TreeSHAP heuristic inference engine, REST endpoints.
- **Build Tooling**: Vite 6, `esbuild`, `tsc`.

---

## 📡 REST API Reference

### 1. Predict Readmission Risk & SHAP Attributions
- **Endpoint**: `POST /api/predict`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "model": "XGBoost (Selected Best)",
  "patient": {
    "age_group": "[70-80)",
    "gender": "Female",
    "time_in_hospital": 6,
    "primary_diagnosis": "Circulatory (Heart Failure / CAD)",
    "secondary_diagnosis": "Diabetes",
    "number_diagnoses": 9,
    "num_lab_procedures": 48,
    "num_procedures": 1,
    "num_medications": 18,
    "number_inpatient": 2,
    "number_emergency": 1,
    "number_outpatient": 0,
    "A1Cresult": ">8",
    "max_glu_serum": "None",
    "insulin_treatment": "Up",
    "change_in_meds": "Ch",
    "diabetes_med": "Yes",
    "admission_type": "Emergency",
    "discharge_disposition": "Discharged to home",
    "admission_source": "Emergency Room"
  }
}
```
- **Response**: `200 OK`
```json
{
  "readmission_probability": 0.742,
  "risk_tier": "High",
  "base_value": 0.421,
  "confidence_interval": { "lower": 0.687, "upper": 0.797 },
  "shap_values": [
    { "feature": "number_inpatient", "attribution": 0.142, "description": "Prior inpatient visits (+14.2%)" },
    { "feature": "primary_diagnosis", "attribution": 0.086, "description": "Circulatory diagnosis (+8.6%)" }
  ],
  "recommendations": [
    "Schedule 48-72h post-discharge home visit or telephonic follow-up",
    "Initiate comprehensive pharmacist medication reconciliation",
    "Enroll in heart failure disease management pathway"
  ]
}
```

### 2. Retrieve Model Benchmark Metrics
- **Endpoint**: `GET /api/models`
- **Response**: Summary of cross-validation metrics for XGBoost, Random Forest, SVM, and Logistic Regression.

### 3. Population Health Statistics
- **Endpoint**: `GET /api/stats`
- **Response**: Aggregated cohort distribution and disease prevalence statistics.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/medrisk-ai.git
   cd medrisk-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## ⚖️ Ethical AI & Clinical Disclaimer

> **RESEARCH & DECISION SUPPORT PROTOTYPE ONLY**:  
> MedRisk AI is developed as an Explainable Artificial Intelligence research artifact and educational decision-support tool. It is **not** a certified Software as a Medical Device (SaMD) and does **not** provide autonomous diagnostic or prescriptive determinations. All clinical risk scores and SHAP attributions must be evaluated in conjunction with licensed clinical judgment, patient-specific circumstances, and institutional guidelines.

---

## 📚 Academic Citation

If you use or reference MedRisk AI or the underlying dataset in your research or project:

```bibtex
@article{strack2014impact,
  title={Impact of HbA1c measurement on hospital readmission rates: analysis of 70,000 clinical database patient records},
  author={Strack, Beata and DeShazo, Jonathan P and Gennings, Chris and Olmo, Juan L and Ventura, Sebastian and Cios, Krzysztof J and Clore, John N},
  journal={BioMed Research International},
  volume={2014},
  year={2014},
  publisher={Hindawi}
}

@software{medrisk_ai_2026,
  author = {MedRisk AI Team},
  title = {MedRisk AI: Explainable AI-Based Hospital Readmission Risk Prediction Web Application},
  year = {2026},
  url = {https://github.com/your-username/medrisk-ai}
}
```
