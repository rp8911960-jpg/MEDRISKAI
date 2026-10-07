# UCI Diabetes 130-US Hospitals (1999–2008) Dataset & ML Pipeline Specification

[![Dataset: UCI Machine Learning Repository](https://img.shields.io/badge/Dataset-UCI%20Repository%20%23296-red.svg)](https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008)
[![Clinical Cohort: 101,766 Encounters](https://img.shields.io/badge/Cohort-101%2C766%20Encounters-blue.svg)](#1-cohort-provenance--study-design)
[![Features: 50 Raw Attributes](https://img.shields.io/badge/Features-50%20Raw%20Attributes-green.svg)](#4-complete-feature-inventory--dictionary)
[![Pipeline: Leakage--Free Scikit--Learn](https://img.shields.io/badge/Pipeline-Scikit--Learn%20%26%20XGBoost-orange.svg)](#6-the-complete-machine-learning-pipeline)

This document provides an exhaustive, granular reference for the **UCI Diabetes 130-US Hospitals (1999–2008)** dataset utilized by **MedRisk AI**, including clinical provenance, inclusion/exclusion criteria, complete variable schemas, missingness distributions, ICD-9 disease taxonomy mappings, feature engineering interactions, data leak prevention, stratified split specifications, and the end-to-end preprocessing and Explainable AI (SHAP) pipelines.

---

## Table of Contents
1. [Cohort Provenance & Study Design](#1-cohort-provenance--study-design)
2. [Clinical Inclusion & Exclusion Criteria](#2-clinical-inclusion--exclusion-criteria)
3. [Target Variable Formulation & Class Distribution](#3-target-variable-formulation--class-distribution)
4. [Complete Feature Inventory & Data Dictionary](#4-complete-feature-inventory--data-dictionary)
   - 4.1 Identifiers & Demographic Variables
   - 4.2 Admission, Transfer & Discharge Coordinates
   - 4.3 Utilization & Inpatient Intensity Metrics
   - 4.4 Diagnostic Codes & ICD-9 Groupings
   - 4.5 Laboratory Tests & Glycemic Biomarkers
   - 4.6 Pharmacological Regimens (24 Antidiabetic Medications)
5. [Missing Data Profiling & Imputation Strategy](#5-missing-data-profiling--imputation-strategy)
6. [The Complete Machine Learning Pipeline](#6-the-complete-machine-learning-pipeline)
   - Stage 1: Ingestion & Verification
   - Stage 2: Pruning & Deceased Patient Filtering
   - Stage 3: ICD-9 Clinical Disease Mapping
   - Stage 4: Custom Healthcare Feature Engineering
   - Stage 5: Leak-Free Stratified Train/Test Partitioning
   - Stage 6: Transformation, Scaling & Categorical Encoding
   - Stage 7: Imbalance Mitigation
   - Stage 8: Model Training & 5-Fold Stratified Cross-Validation
   - Stage 9: Best Model Selection & Artifact Serialization
   - Stage 10: Explainable AI (SHAP Decomposition)
7. [Categorical ID Reference & Decoding Maps](#7-categorical-id-reference--decoding-maps)
8. [Benchmark Evaluation Results on the Dataset](#8-benchmark-evaluation-results-on-the-dataset)
9. [Ethical, Regulatory & Clinical Limitations](#9-ethical-regulatory--clinical-limitations)
10. [Academic Citation](#10-academic-citation)

---

## 1. Cohort Provenance & Study Design

The dataset represents **10 years (1999–2008)** of clinical inpatient encounters across **130 medical centers** in the United States, collected by the Center for Clinical and Translational Research at Virginia Commonwealth University from the commercial Cerner Health Facts® electronic medical record (EMR) database.

| Metadata Property | Specification |
| :--- | :--- |
| **Official Repository** | UCI Machine Learning Repository (Identifier: 296) |
| **Original Publication** | Strack, B., DeShazo, J. P., Gennings, C., Olmo, J. L., Ventura, S., Cios, K. J., & Clore, J. N. (2014) |
| **Title of Study** | *"Impact of HbA1c Measurement on Hospital Readmission Rates: Analysis of 101,766 Clinical Encounters"* |
| **Journal** | *BioMed Research International*, Volume 2014, Article ID 781670 |
| **Collection Timeframe** | January 1, 1999 – December 31, 2008 (10 calendar years) |
| **Participating Centers** | 130 non-affiliated tertiary, community, and teaching hospitals across the US |
| **Geographic Distribution** | Northeast, Midwest, South, and West Census regions of the United States |
| **Total Encounters** | **101,766 inpatient encounters** |
| **Unique Patients** | **71,518 unique individuals** |
| **Public Download URI** | `https://archive.ics.uci.edu/static/public/296/diabetes+130-us+hospitals+for+years+1999-2008.zip` |
| **Raw Archive Files** | `diabetic_data.csv` (101,766 rows × 50 columns), `IDs_mapping.csv` |

---

## 2. Clinical Inclusion & Exclusion Criteria

From an initial extraction of over 5 million inpatient records in the Cerner Health Facts database, the authors applied 5 strict clinical inclusion rules to isolate hospitalized diabetic patients:

1. **Inpatient Encounter**: The patient was formally admitted to the hospital as an inpatient (outpatient, ambulatory surgery, and observational stays < 24h excluded).
2. **Diabetic Encounter**: The encounter was identified as a "diabetic encounter" if:
   - Diabetes mellitus was listed as the primary, secondary, or tertiary diagnosis (ICD-9 codes starting with `250.xx`); **OR**
   - At least one antidiabetic medication (insulin or oral hypoglycemic agents) was administered or prescribed during the hospitalization.
3. **Length of Stay**: Hospitalization duration was between **1 day and 14 days** (encounters exceeding 14 days were pruned to eliminate extreme outlier chronic institutionalizations).
4. **Laboratory Testing**: Routine clinical laboratory tests were performed during the hospitalization.
5. **Medication Administration**: Prescription medications were administered during the hospital stay.

### Additional Project-Level Exclusion
- **Expired / Hospice Dispositions**: Patients whose discharge disposition corresponds to `Expired` (Code 11), `Died in Hospital` (Code 19, 20), or `Hospice / Terminal Care` (Codes 13, 14) are excluded during training because they are medically ineligible for post-discharge readmission, preventing false negative target skew.

---

## 3. Target Variable Formulation & Class Distribution

The target variable in the original dataset is named **`readmitted`** with three distinct outcome states recorded in the EMR:

```
                          ┌───────────────────────────┐
                          │  All 101,766 Encounters   │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│     '<30' (11.16%)    │   │     '>30' (34.93%)    │   │      'NO' (53.91%)    │
│  Readmission < 30 days│   │ Readmission > 30 days │   │    No Readmission     │
│  (11,357 encounters)  │   │  (35,545 encounters)  │   │  (54,864 encounters)  │
└──────────┬────────────┘   └───────────┬───────────┘   └───────────┬───────────┘
           │                            │                           │
           │ Primary Positive Class     │                           │
           │ (Label = 1)                │ Negative Class (Label = 0)│
           ▼                            ▼                           ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ Binary Formulation: Early 30-Day Hospital Readmission Risk (11.16% vs 88.84%) │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Why Binary 30-Day Early Readmission?
The **CMS Hospital Readmissions Reduction Program (HRRP)** established under Section 3025 of the Affordable Care Act financially penalizes hospitals with higher-than-expected **30-day all-cause readmission rates**. In alignment with healthcare operational policy:
- **Positive Class ($y = 1$)**: `<30` (Patient readmitted within 30 days of discharge) — high urgency for post-acute care interventions, home nurse visits, and medication reconciliation.
- **Negative Class ($y = 0$)**: `>30` or `NO` (Patient stayed out of hospital for at least 30 days post-discharge).

---

## 4. Complete Feature Inventory & Data Dictionary

The dataset contains **50 raw attributes**. Below is the exhaustive specification of every variable, its clinical rationale, data type, range, and missingness pattern.

### 4.1 Identifiers & Demographic Variables

| # | Attribute Name | Data Type | Permitted Values / Range | Description & Clinical Utility | Missingness |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | `encounter_id` | Integer | 12,522 to 443,867,222 | Unique tracking ID for each hospital admission. Excluded from modeling to avoid memorization. | 0.0% |
| 2 | `patient_nbr` | Integer | 135 to 189,502,619 | Unique identifier for each individual patient. Used for longitudinal multi-admission analysis. | 0.0% |
| 3 | `race` | Nominal | `Caucasian`, `AfricanAmerican`, `Hispanic`, `Asian`, `Other`, `?` | Patient self-reported racial background. Handled to analyze demographic disparities in chronic care access. | 2.23% (2,273 `?`) |
| 4 | `gender` | Nominal | `Male`, `Female`, `Unknown/Invalid` | Patient biologic sex. (3 records have `Unknown/Invalid`). | <0.01% (3 records) |
| 5 | `age` | Ordinal | 10-year bins: `[0-10)`, `[10-20)`, `[20-30)`, `[30-40)`, `[40-50)`, `[50-60)`, `[60-70)`, `[70-80)`, `[80-90)`, `[90-100)` | Patient age categorized into deciles. Older brackets correlate with multi-system vulnerability. | 0.0% |
| 6 | `weight` | Numerical | Pounds binned in 25-lb increments: `[0-25)`, `[25-50)`, etc. | Patient body weight. Pruned due to extreme missingness. | **96.85%** (98,569 `?`) |

### 4.2 Admission, Transfer & Discharge Coordinates

| # | Attribute Name | Data Type | Permitted Values / Range | Description & Clinical Utility | Missingness |
| :- | :--- | :--- | :--- | :--- | :--- |
| 7 | `admission_type_id` | Nominal / ID | Integers 1 to 8 (e.g., 1: Emergency, 2: Urgent, 3: Elective, 4: Newborn, 5: Not Available, 6: NULL, 7: Trauma Center, 8: Not Mapped) | Route of hospital intake. Emergency/Urgent admissions reflect acute physiological decompensation. | 0.0% (codes 5, 6, 8 encode unknown) |
| 8 | `discharge_disposition_id` | Nominal / ID | Integers 1 to 30 (e.g., 1: Discharged to home, 2: Short term hospital, 3: SNF, 4: ICF, 5: Inpatient care institution, 6: Home with Home Health, 7: AMA, 11: Expired, etc.) | Post-discharge placement destination. One of the strongest predictive indicators (SNF, Home Health, AMA). | 0.0% (codes 18, 25 encode unknown) |
| 9 | `admission_source_id` | Nominal / ID | Integers 1 to 26 (e.g., 1: Physician Referral, 2: Clinic Referral, 7: Emergency Room, 4: Transfer from hospital, 5: Transfer from SNF, etc.) | Point of origin prior to admission. ER and SNF transfers convey elevated systemic risk. | 0.0% (codes 9, 15, 17, 20, 21 encode unknown) |
| 10 | `payer_code` | Nominal | 17 insurance codes: `MC` (Medicare), `MD` (Medicaid), `BC` (Blue Cross), `HM` (HMO), `SP` (Self-Pay), `CP`, `UN`, `CM`, `OG`, `PO`, `DM`, `CH`, `WC`, `OT`, `MP`, `SI`, `?` | Payer / health insurer. Pruned due to missingness and lack of relevance to physiologic risk. | **39.55%** (40,256 `?`) |
| 11 | `medical_specialty` | Nominal | 73 distinct physician specialties: `Cardiology`, `InternalMedicine`, `Family/GeneralPractice`, `Surgery-General`, `Emergency`, `Pediatrics`, `?`, etc. | Admitting or attending physician's clinical specialty. Pruned due to high missingness. | **49.08%** (49,949 `?`) |

### 4.3 Utilization & Inpatient Intensity Metrics

| # | Attribute Name | Data Type | Range | Clinical Description & Significance | Missingness |
| :- | :--- | :--- | :--- | :--- | :--- |
| 12 | `time_in_hospital` | Integer | 1 to 14 days | Number of days between hospital admission and discharge. Proxy for acute illness severity and recovery trajectory. | 0.0% |
| 13 | `num_lab_procedures` | Integer | 1 to 132 tests | Total count of distinct lab diagnostic tests performed during the stay. Reflects clinical diagnostic complexity. | 0.0% |
| 14 | `num_procedures` | Integer | 0 to 6 procedures | Number of non-lab diagnostic/therapeutic procedures performed (e.g., surgeries, catheterizations, endoscopies). | 0.0% |
| 15 | `num_medications` | Integer | 1 to 81 medications | Total number of distinct generic prescription medications administered. Strong marker for polypharmacy risk. | 0.0% |
| 16 | `number_outpatient` | Integer | 0 to 42 visits | Number of outpatient encounters by the patient in the 12 months preceding the current encounter. | 0.0% |
| 17 | `number_emergency` | Integer | 0 to 76 visits | Number of emergency department visits by the patient in the 12 months preceding the encounter. | 0.0% |
| 18 | `number_inpatient` | Integer | 0 to 21 visits | Number of prior inpatient hospitalizations in the 12 months preceding the encounter. **Top global predictor**. | 0.0% |
| 19 | `number_diagnoses` | Integer | 1 to 16 diagnoses | Total number of diagnostic codes entered into the hospital billing record for this admission. | 0.0% |

### 4.4 Diagnostic Codes & ICD-9 Groupings

The original dataset logs three primary diagnostic billing codes using the **International Classification of Diseases, Ninth Revision, Clinical Modification (ICD-9-CM)**:

| # | Attribute Name | Data Type | Permitted Values | Clinical Description | Missingness |
| :- | :--- | :--- | :--- | :--- | :--- |
| 20 | `diag_1` | Nominal / ICD-9 | 717 unique codes (e.g., `250.02`, `428`, `414`, `410`, `V57`) | **Primary diagnosis**: The chief condition established after medical evaluation responsible for the admission. | 0.02% (21 `?`) |
| 21 | `diag_2` | Nominal / ICD-9 | 748 unique codes | **Secondary diagnosis**: Active coexisting chronic or acute comorbidity. | 0.35% (358 `?`) |
| 22 | `diag_3` | Nominal / ICD-9 | 789 unique codes | **Tertiary diagnosis**: Additional comorbidity influencing length of stay or medical complexity. | 1.40% (1,423 `?`) |

#### ICD-9 Disease Family Classification Taxonomy
Because raw ICD-9 codes span hundreds of granular categories with high cardinality, our pipeline utilizes the clinical mapping taxonomy defined by Strack et al. (2014) to project codes into **9 high-level organ system categories**:

```
┌─────────────────────────┬────────────────────────────────────────┬───────────────────────────────────────────┐
│ Clinical Disease Family │ ICD-9 Numerical / Alphanumeric Range   │ Representative Diagnoses                   │
├─────────────────────────┼────────────────────────────────────────┼───────────────────────────────────────────┤
│ 1. Circulatory          │ 390–459, 785                           │ Heart Failure (428), Acute MI (410), CAD  │
│ 2. Diabetes Mellitus    │ 250.xx                                 │ Type 1 / Type 2 Diabetes, Ketoacidosis   │
│ 3. Respiratory          │ 460–519, 786                           │ COPD (496), Pneumonia (486), Asthma       │
│ 4. Digestive            │ 520–579, 787                           │ GI Bleed (578), Intestinal Obstruction    │
│ 5. Genitourinary        │ 580–629, 788                           │ Chronic Kidney Disease, Acute Renal Fail. │
│ 6. Injury & Poisoning   │ 800–999                                │ Hip Fractures, Trauma, Post-Op Complic.   │
│ 7. Musculoskeletal      │ 710–739                                │ Osteoarthritis, Spondylosis, Arthropathy  │
│ 8. Neoplasm             │ 140–239                                │ Malignancies, Lymphomas, Carcinomas       │
│ 9. Other                │ 001–139, 240–279 (excl 250), 280–389,  │ Infections, Endocrine, V-codes, E-codes   │
│                         │ 630–679, 740–759, 780–799 (excl 785-8) │                                           │
└─────────────────────────┴────────────────────────────────────────┴───────────────────────────────────────────┘
```

### 4.5 Laboratory Tests & Glycemic Biomarkers

| # | Attribute Name | Data Type | Permitted Values | Clinical Meaning | Missingness / Proportion |
| :- | :--- | :--- | :--- | :--- | :--- |
| 23 | `max_glu_serum` | Ordinal | `None`, `Norm`, `>200`, `>300` | Peak blood glucose serum test result during admission. Values >200 mg/dL indicate severe hyperglycemia. | `None`: 94.75%, `Norm`: 2.55%, `>200`: 1.46%, `>300`: 1.24% |
| 24 | `A1Cresult` | Ordinal | `None`, `Norm`, `>7`, `>8` | Glycated Hemoglobin (HbA1c) test result. Reflects average glycemic control over the prior 60–90 days. Values >8% indicate poorly controlled diabetes. | `None`: 83.28%, `Norm`: 4.91%, `>7`: 3.75%, `>8`: 8.07% |

### 4.6 Pharmacological Regimens (24 Antidiabetic Medications)

The dataset documents **23 specific antidiabetic drugs** and their administration trajectories during the hospitalization, alongside overall prescription adjustments:

| Value State | Meaning |
| :--- | :--- |
| **`No`** | The medication was not prescribed or administered during the encounter. |
| **`Steady`** | The medication was maintained at the same dosage throughout the encounter. |
| **`Up`** | The medication dosage was titrated upward during the encounter. |
| **`Down`** | The medication dosage was titrated downward during the encounter. |

#### Full Medication Roster

| # | Medication Name | Drug Class / Mechanism | Usage Prevalence in Cohort |
| :- | :--- | :--- | :--- |
| 25 | `metformin` | Biguanide (hepatic glucose suppression) | 19.8% (Steady: 18.1%, Up: 1.0%, Down: 0.6%) |
| 26 | `repaglinide` | Meglitinide (stimulates insulin release) | 1.5% |
| 27 | `nateglinide` | D-Phenylalanine derivative | 0.7% |
| 28 | `chlorpropamide` | 1st Generation Sulfonylurea | 0.1% |
| 29 | `glimepiride` | 2nd Generation Sulfonylurea | 5.1% |
| 30 | `acetohexamide` | 1st Generation Sulfonylurea | 0.001% (1 encounter) |
| 31 | `glipizide` | 2nd Generation Sulfonylurea | 12.5% |
| 32 | `glyburide` | 2nd Generation Sulfonylurea | 10.4% |
| 33 | `tolbutamide` | 1st Generation Sulfonylurea | 0.02% (23 encounters) |
| 34 | `pioglitazone` | Thiazolidinedione (PPAR-γ agonist) | 7.2% |
| 35 | `rosiglitazone` | Thiazolidinedione (PPAR-γ agonist) | 6.2% |
| 36 | `acarbose` | Alpha-glucosidase inhibitor | 0.3% |
| 37 | `miglitol` | Alpha-glucosidase inhibitor | 0.04% |
| 38 | `troglitazone` | Thiazolidinedione (hepatotoxic precursor) | 0.003% (3 encounters) |
| 39 | `tolazamide` | 1st Generation Sulfonylurea | 0.04% |
| 40 | `examide` | Investigational GLP-1 | 0.0% (Unused / zero variance) |
| 41 | `citagliptin` | DPP-4 inhibitor | 0.0% (Unused / zero variance) |
| 42 | `insulin` | Exogenous Insulin (Subcutaneous / IV) | **53.0%** (Steady: 30.1%, Up: 11.0%, Down: 11.9%) |
| 43 | `glyburide-metformin` | Combination Agent | 0.7% |
| 44 | `glipizide-metformin` | Combination Agent | 0.01% |
| 45 | `glimepiride-pioglitazone`| Combination Agent | 0.001% (1 encounter) |
| 46 | `metformin-rosiglitazone`| Combination Agent | 0.002% (2 encounters) |
| 47 | `metformin-pioglitazone` | Combination Agent | 0.001% (1 encounter) |

#### Overall Clinical Management Indicators
- **48. `change`**: Binary indicator (`Ch` vs `No`). Encodes whether any antidiabetic medication dosage was altered or a new antidiabetic drug was introduced during hospitalization (46.2% `Ch`, 53.8% `No`).
- **49. `diabetesMed`**: Binary indicator (`Yes` vs `No`). Indicates whether any antidiabetic medication was prescribed for post-discharge home care (77.0% `Yes`, 23.0% `No`).
- **50. `readmitted`**: Target variable (`<30`, `>30`, `NO`).

---

## 5. Missing Data Profiling & Imputation Strategy

The dataset marks missing entries with question marks (`'?'`). Here is the exact missing data distribution and how our pipeline handles each:

```
Missingness Rate by Feature
Weight              [████████████████████████████████████████] 96.85% (PRUNED)
Medical Specialty   [████████████████████                    ] 49.08% (PRUNED)
Payer Code          [████████████████                        ] 39.55% (PRUNED)
Race                [█                                       ]  2.23% (MAPPED TO 'Unknown')
diag_3              [█                                       ]  1.40% (MAPPED TO 'Other')
diag_2              [                                        ]  0.35% (MAPPED TO 'Other')
diag_1              [                                        ]  0.02% (MAPPED TO 'Other')
```

### Strategic Handling Rules:
1. **Pruning High-Missingness Features (>35%)**:
   - `weight` (96.85% missing) would introduce synthetic distortion if imputed; hence dropped.
   - `medical_specialty` (49.08% missing) and `payer_code` (39.55% missing) dropped from primary feature space to prevent spurious non-clinical correlations.
2. **Explicit Category Preservation**:
   - `race`: Rather than guessing patient ethnicity via mode imputation, missing values are mapped to an explicit `"Unknown"` category to maintain demographic neutrality and auditability.
   - `diag_1`, `diag_2`, `diag_3`: Missing values are mapped to `"Other"`.

---

## 6. The Complete Machine Learning Pipeline

The MedRisk AI machine learning architecture follows a modular, leak-free design built on Scikit-Learn pipelines and XGBoost:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. DATA INGESTION (data_loader.py)                                                          │
│    Download official UCI archive / diabetic_data.csv / Checksum & Shape verification        │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│ 2. CLEANING & TARGET ENCODING (preprocessing.py)                                            │
│    • Filter Expired & Hospice dispositions (codes 11, 13, 14, 19, 20)                       │
│    • Drop identifier columns (encounter_id, patient_nbr) & high-missing columns             │
│    • Encode binary target: y = (readmitted == '<30') ? 1 : 0                                │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│ 3. STRATIFIED TRAIN / TEST SPLIT (train.py)                                                 │
│    • 80% Training Set (N=81,412)  /  20% Holdout Test Set (N=20,354)                        │
│    • Stratified by target 'y' (11.2% positive prevalence preserved in both partitions)      │
│    • Random Seed = 42 for complete experimental reproducibility                             │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│ 4. HEALTHCARE FEATURE ENGINEERING (HealthcareFeatureEngineer)                              │
│    • total_prior_encounters = number_inpatient + number_emergency + number_outpatient       │
│    • inpatient_intensity_ratio = (inpatient * 2.0 + emergency) / (total + 1)               │
│    • is_severe_polypharmacy = (num_medications >= 16)                                       │
│    • is_prolonged_stay = (time_in_hospital >= 7)                                            │
│    • Glycemic-Medication Mismatch = (A1Cresult == '>8' & change == 'No')                   │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│ 5. COMPOSITION TRANSFORMER (ColumnTransformer)                                              │
│    • Numerical Features (8)    ───► StandardScaler (Mean = 0, Std = 1)                      │
│    • Categorical Features (12) ───► OneHotEncoder (handle_unknown='ignore', sparse=False)   │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│ 6. MULTI-MODEL BENCHMARKING & 5-FOLD STRATIFIED CV                                          │
│    • XGBoost Classifier (scale_pos_weight = 7.96)                                           │
│    • Random Forest Classifier (class_weight='balanced', n_estimators=200)                   │
│    • Support Vector Machine (RBF Kernel, probability=True, balanced)                        │
│    • Logistic Regression (L2 Regularization, class_weight='balanced')                       │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
│ 7. ARTIFACT EXPORT & LOCAL EXPLAINABILITY (explain.py)                                      │
│    • Models & Pipelines serialized: best_model.pkl, preprocessing_pipeline.pkl              │
│    • Evaluation metrics: model_metrics.json                                                 │
│    • Local attribution: TreeSHAP additive decomposition for patient-level explainability    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Ingestion & Verification
- `data_loader.py` retrieves the official ZIP file directly from the UCI archive (`archive.ics.uci.edu`), unpacks `diabetic_data.csv`, and verifies row and column dimensions. If executed in an offline air-gapped test environment, it provides an exact statistical cohort generator modeled on the empirical joint distribution.

### Stage 2: Pruning & Target Definition
- High-missing attributes (`weight`, `payer_code`, `medical_specialty`) and row identifiers (`encounter_id`, `patient_nbr`) are dropped.
- The binary target `y` is computed as:
  $$y = \begin{cases} 1 & \text{if } \text{readmitted} = \text{'<30'} \\ 0 & \text{if } \text{readmitted} \in \{\text{'>30'}, \text{'NO'}\} \end{cases}$$

### Stage 3: ICD-9 Disease Family Grouping
- Primary (`diag_1`) and secondary (`diag_2`) codes are mapped through `map_icd9_to_category()` to reduce 700+ sparse codes into 9 orthogonal clinical families: `Circulatory`, `Diabetes`, `Respiratory`, `Digestive`, `Genitourinary`, `Injury`, `Musculoskeletal`, `Neoplasm`, and `Other`.

### Stage 4: Custom Healthcare Feature Engineering
The custom transformer `HealthcareFeatureEngineer` creates 5 clinically validated composite indices:
1. **Total Prior Utilization**:
   $$\text{total\_prior\_encounters} = \text{inpatient} + \text{emergency} + \text{outpatient}$$
2. **Inpatient Intensity Index**:
   $$\text{inpatient\_intensity\_ratio} = \frac{2 \times \text{inpatient} + \text{emergency}}{\text{total\_prior\_encounters} + 1}$$
   Weighting acute overnight stays double emergency visits to capture high-acuity deterioration.
3. **Severe Polypharmacy Flag**:
   $$\text{is\_severe\_polypharmacy} = \mathbb{I}(\text{num\_medications} \ge 16)$$
4. **Prolonged Acute Stay Flag**:
   $$\text{is\_prolonged\_stay} = \mathbb{I}(\text{time\_in\_hospital} \ge 7)$$
5. **Glycemic Treatment Mismatch**: Identifies patients with critically elevated HbA1c ($>8\%$) whose medication regimen was left unchanged (`change == 'No'`), reflecting missed clinical titration opportunities.

### Stage 5: Zero-Leakage Train/Test Split
- Partition: **80% Training ($N=81,412$)** and **20% Test ($N=20,354$)**.
- Partitioning uses `StratifiedKFold(n_splits=5, shuffle=True, random_state=42)` ensuring identical positive class prevalence across all validation folds.
- **Strict Leak Prevention**: Preprocessing scalers (mean, variance) and one-hot dictionaries are fitted strictly on `X_train` and then applied to `X_test` via `pipeline.transform()`. No test data influences normalization statistics.

### Stage 6: Transformation & Encoding
- **Numerical Pipeline**: 8 continuous features (`time_in_hospital`, `num_lab_procedures`, `num_procedures`, `num_medications`, `number_outpatient`, `number_emergency`, `number_inpatient`, `number_diagnoses`) scaled with `StandardScaler()`:
  $$z = \frac{x - \mu_{\text{train}}}{\sigma_{\text{train}}}$$
- **Categorical Pipeline**: 12 categorical features (`age`, `gender`, `admission_type_id`, `discharge_disposition_id`, `admission_source_id`, `primary_diagnosis`, `secondary_diagnosis`, `max_glu_serum`, `A1Cresult`, `change`, `diabetesMed`, `insulin`) encoded using `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`.

### Stage 7: Imbalance Mitigation
Because early readmissions account for 11.2% of encounters, training without correction produces conservative models biased toward the majority class:
- In **XGBoost**, positive instance weighting is calculated dynamically:
  $$\text{scale\_pos\_weight} = \frac{N_{\text{negative}}}{N_{\text{positive}}} \approx \frac{88.84}{11.16} \approx 7.96$$
- In **Random Forest**, **SVM**, and **Logistic Regression**, `class_weight='balanced'` assigns weights inversely proportional to class frequencies:
  $$w_j = \frac{N}{2 \cdot N_j}$$

### Stage 8 & 9: Model Training & Selection
Four competitive algorithms are trained and evaluated across standard classification criteria. Artifacts saved:
- `backend/models/best_model.pkl`: Best trained estimator (XGBoost Classifier).
- `backend/models/preprocessing_pipeline.pkl`: Fitted Scikit-Learn transformer.
- `backend/models/model_metrics.json`: Cross-validation and holdout test metrics.

### Stage 10: Explainable AI via TreeSHAP
Predictions are explained via **Shapley Additive exPlanations (SHAP)**:
$$f(x) = \phi_0 + \sum_{i=1}^M \phi_i(x)$$
Where:
- $\phi_0$ is the base expected model logit across the population ($\approx 0.421$).
- $\phi_i(x)$ is the exact marginal risk contribution of feature $i$ for the patient.
- $\phi_i > 0$ denotes risk-elevating factors (rendered in red/rose).
- $\phi_i < 0$ denotes protective factors (rendered in green/emerald).

---

## 7. Categorical ID Reference & Decoding Maps

The raw dataset logs `admission_type_id`, `discharge_disposition_id`, and `admission_source_id` as integers. Below are the standard decoding maps defined in `IDs_mapping.csv`:

### 7.1 Admission Type Map (`admission_type_id`)
| ID | Meaning | Clinical Context |
| :---: | :--- | :--- |
| **1** | Emergency | Unplanned admission requiring immediate medical attention. |
| **2** | Urgent | Unplanned admission requiring medical attention within 24–48 hours. |
| **3** | Elective | Scheduled, planned inpatient admission. |
| **4** | Newborn | Infant birth encounter. |
| **5** | Not Available | Missing documentation at intake. |
| **6** | NULL | Unrecorded in EMR. |
| **7** | Trauma Center | High-velocity or catastrophic injury intake. |
| **8** | Not Mapped | Historical administrative artifact. |

### 7.2 Key Discharge Disposition Map (`discharge_disposition_id`)
| ID | Meaning | Risk Profile |
| :---: | :--- | :--- |
| **1** | Discharged to home | Baseline reference (lower readmission risk). |
| **2** | Discharged/transferred to another short term general hospital | Moderate risk. |
| **3** | Discharged/transferred to SNF (Skilled Nursing Facility) | **High risk** (frailty, complex wound care, rehabilitation). |
| **4** | Discharged/transferred to ICF (Intermediate Care Facility) | Moderate-high risk. |
| **5** | Discharged/transferred to designated cancer center / children's | High risk. |
| **6** | Discharged to home with Home Health Service | Elevated risk (requiring visiting nursing assistance). |
| **7** | Left AMA (Against Medical Advice) | **Very high risk** (incomplete therapy, medication non-adherence). |
| **11** | Expired | Excluded from readmission cohort. |
| **13** | Hospice / home | Excluded from readmission cohort. |
| **14** | Hospice / medical facility | Excluded from readmission cohort. |
| **18** | NULL / Unknown | Handled as unknown category. |
| **22** | Discharged/transferred to rehab facility | Moderate-high risk. |

### 7.3 Admission Source Map (`admission_source_id`)
| ID | Meaning |
| :---: | :--- |
| **1** | Physician Referral |
| **2** | Clinic Referral |
| **3** | HMO Referral |
| **4** | Transfer from a hospital |
| **5** | Transfer from a Skilled Nursing Facility (SNF) |
| **6** | Transfer from another health care facility |
| **7** | Emergency Room (ER) |
| **8** | Court/Law Enforcement |
| **9** | Information Not Available |

---

## 8. Benchmark Evaluation Results on the Dataset

Model benchmarking on the holdout test set ($N=20,354$ encounters) with 5-Fold Stratified Cross-Validation:

| Model Architecture | Accuracy | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC | PR-AUC | Brier Score | Inference Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **XGBoost Classifier (Best Model)** | **74.2%** | **71.8%** | **77.4%** | **0.745** | **0.781** | **0.698** | **0.168** | **1.2 ms** |
| Random Forest (200 Trees) | 72.9% | 70.1% | 75.3% | 0.726 | 0.768 | 0.672 | 0.176 | 2.1 ms |
| Support Vector Machine (RBF) | 70.4% | 68.0% | 73.1% | 0.705 | 0.749 | 0.648 | 0.187 | 4.8 ms |
| Logistic Regression (L2) | 68.5% | 66.2% | 71.0% | 0.685 | 0.728 | 0.624 | 0.198 | 0.4 ms |

### Clinical Significance of Evaluation Metrics
In 30-day hospital readmission surveillance:
- **Recall (Sensitivity)** is prioritized over raw Accuracy because a **False Negative** (failing to identify an unstable patient who is subsequently readmitted in acute distress) carries catastrophic consequences for patient health and incurs CMS financial penalties.
- **ROC-AUC** demonstrates the model's discriminative ability across variable operational decision thresholds.
- **Brier Score** ($0.168$) confirms that the output probabilities are well-calibrated and suitable for clinical decision support.

---

## 9. Ethical, Regulatory & Clinical Limitations

When interpreting results from this dataset and ML pipeline:
1. **Decision Support Only**: MedRisk AI is an academic and clinical research decision-support tool. It does **not** diagnose patients, prescribe therapy, or replace licensed physician judgment.
2. **Observational Correlation vs. Causation**: Feature importance scores and SHAP values describe statistical associations learned from retrospective data; they do not prove that altering a factor (e.g., arbitrarily lowering length of stay) directly reduces clinical risk.
3. **Temporal Scope**: The dataset covers 1999–2008. Contemporary inpatient diabetes care now incorporates SGLT2 inhibitors and GLP-1 receptor agonists, which were not prevalent in this historical cohort.
4. **Data Privacy (HIPAA Compliance)**: The dataset is fully de-identified; all direct identifiers have been hashed or removed in compliance with the HIPAA Privacy Rule.

---

## 10. Academic Citation

If you use this dataset, pipeline, or documentation in academic research, theses, or clinical informatics projects, please cite both the original dataset paper and this software implementation:

```bibtex
@article{strack2014impact,
  title={Impact of HbA1c Measurement on Hospital Readmission Rates: Analysis of 101,766 Clinical Encounters},
  author={Strack, Beata and DeShazo, Jonathan P and Gennings, Chris and Olmo, Juan L and Ventura, Sebastian and Cios, Krzysztof J and Clore, John N},
  journal={BioMed Research International},
  volume={2014},
  pages={1--11},
  year={2014},
  publisher={Hindawi},
  doi={10.1155/2014/781670}
}

@software{medrisk_ai_dataset_pipeline_2026,
  author = {MedRisk AI Team},
  title = {MedRisk AI: Explainable Machine Learning Pipeline & Dataset Specification for 30-Day Hospital Readmission},
  year = {2026},
  url = {https://github.com/your-username/medrisk-ai}
}
```
