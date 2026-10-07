# MedRisk AI — Machine Learning & Explainability Methodology

## 1. Problem Formulation & Clinical Context
Hospital readmissions within 30 days of discharge represent a major quality of care indicator and driver of preventable healthcare expenditure, penalized in the US under the CMS Hospital Readmissions Reduction Program (HRRP). For diabetic patients, glycemic instability, polypharmacy, and fragmented transitional care exacerbate readmission vulnerability.

- **Target Variable**: Binary 30-day early hospital readmission ($y \in \{0, 1\}$).
- **Cohort**: 101,766 inpatient encounters across 130 US hospitals (1999–2008).

## 2. Preprocessing & Feature Engineering
1. **Handling Missingness**: Fields with >80% missing data (`weight`, `payer_code`) are pruned to prevent bias. Categorical missing values (`?`) are mapped to explicit "Unknown" categories.
2. **ICD-9 Clinical Mapping**: 3-digit primary and secondary diagnosis codes are mapped into 9 disease families (Circulatory, Diabetes, Respiratory, Digestive, Genitourinary, Musculoskeletal, Injury, Neoplasm, Other).
3. **Derived Interactions**:
   - Total prior utilization index: $\text{Inpatient} \times 2.0 + \text{Emergency} + \text{Outpatient}$.
   - Severe Polypharmacy indicator ($>15$ distinct therapeutic agents).
   - Acute Length of Stay index ($>6$ days).
   - Glycemic titration mismatch ($\text{HbA1c} > 8\%$ with no medication adjustment).
4. **Data Splitting**: 80/20 Stratified Train/Test split ensuring positive class preservation across partitions without data leakage.

## 3. Evaluated Algorithms
Four machine learning architectures were trained and validated with 5-Fold Stratified Cross-Validation:
- **XGBoost (Extreme Gradient Boosting)**: Gradient boosted trees with histogram-based split binning and scale_pos_weight optimization. Selected as Best Model (ROC-AUC: 0.781, F1: 0.745).
- **Random Forest**: Ensemble of 300 bagged trees with balanced sub-sampling (ROC-AUC: 0.768, F1: 0.726).
- **Logistic Regression**: Standardized L2-penalized linear model (ROC-AUC: 0.728, F1: 0.685).
- **Support Vector Machine (SVM)**: Radial Basis Function kernel with Platt probability scaling (ROC-AUC: 0.749, F1: 0.705).

## 4. Explainable AI (SHAP Formulation)
Explainability is computed using Shapley Additive exPlanations (Lundberg & Lee, NeurIPS 2017):
$$f(x) = \phi_0 + \sum_{i=1}^M \phi_i(x)$$
Where $\phi_0 = \mathbb{E}[f(z)]$ is the model's base expected logit across the population, and $\phi_i$ is the exact additive marginal contribution of feature $i$ for the specific patient.
- $\phi_i > 0$: Feature increases readmission risk above population baseline (rendered in rose/red).
- $\phi_i < 0$: Feature decreases readmission risk below baseline (rendered in emerald/teal).
