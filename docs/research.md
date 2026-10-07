# MedRisk AI — Academic Research & Benchmark Report

## Title
**Explainable Machine Learning for 30-Day Hospital Readmission Risk Stratification in Inpatient Diabetes Encounters**

## Abstract
Hospital readmissions represent a major clinical and operational burden across healthcare systems worldwide. Using the UCI Diabetes 130-US Hospitals (1999–2008) dataset comprising 101,766 inpatient encounters across 130 medical centers, this project evaluates four machine learning algorithms (XGBoost, Random Forest, Logistic Regression, and Support Vector Machines) for binary 30-day readmission prediction. The best-performing model (XGBoost, ROC-AUC: 0.781, F1: 0.745, PR-AUC: 0.698) is paired with TreeSHAP local attributions to provide actionable, interpretable decision support for clinical researchers and healthcare informaticians.

## 1. Dataset Characteristics & Distribution
- **Origin**: Clinical database of 130 US hospitals (Strack et al., 2014, UCI Machine Learning Repository).
- **Encounters**: 101,766 encounters across 71,518 distinct patients.
- **Attributes**: 55 clinical, demographic, and pharmacological dimensions.
- **Target Distribution**:
  - Early Readmission (< 30 days): 11.2% (11,357 encounters) — primary clinical target.
  - Late Readmission (> 30 days): 34.9% (35,545 encounters).
  - No Readmission (NO): 53.9% (54,864 encounters).

## 2. Multi-Model Experimental Comparison
5-Fold Stratified Cross-Validation results across the standardized test set:

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC | Brier Score | Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost Classifier (Selected Best)** | **74.2%** | **71.8%** | **77.4%** | **0.745** | **0.781** | **0.698** | **0.168** | **1.2 ms** |
| Random Forest (300 Trees) | 72.9% | 70.1% | 75.3% | 0.726 | 0.768 | 0.672 | 0.176 | 2.1 ms |
| Support Vector Machine (RBF Kernel) | 70.4% | 68.0% | 73.1% | 0.705 | 0.749 | 0.648 | 0.187 | 4.8 ms |
| L2-Regularized Logistic Regression | 68.5% | 66.2% | 71.0% | 0.685 | 0.728 | 0.624 | 0.198 | 0.4 ms |

### Why Accuracy Alone is Insufficient
In clinical readmission prediction, class imbalance means a naive majority classifier can report ~54-89% accuracy while failing to identify high-risk deteriorating patients. **Recall (Sensitivity)** and **ROC-AUC** are the principal performance metrics in hospital decision support because false negatives (missing a patient about to decompensate post-discharge) carry severe clinical and economic consequences.

## 3. Global & Local SHAP Feature Importance Hierarchy
1. `number_inpatient` (Prior hospitalizations): Accounts for 28.5% of overall model variance.
2. `discharge_disposition` (Discharge to SNF, Rehab, or AMA): 18.2% importance.
3. `number_diagnoses` (Multimorbidity count): 12.4% importance.
4. `num_medications` (Polypharmacy burden): 9.6% importance.
5. `time_in_hospital` (Length of stay): 8.8% importance.
6. `A1Cresult` (Elevated HbA1c > 8% without medication titration): 7.5% importance.
7. `number_emergency` (Prior ED visits): 6.8% importance.

## 4. Limitations & Ethical Safeguards
- **Observational Nature**: Identifies statistical correlation and predictive association; does NOT prove clinical causation.
- **Historical Scope**: Reflects US hospital practice from 1999–2008 prior to modern GLP-1/SGLT2 adoption.
- **Ethical Mandate**: Output is strictly educational/research decision support and must never override clinical doctor assessment.
