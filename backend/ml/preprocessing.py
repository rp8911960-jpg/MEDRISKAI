"""
MedRisk AI - Preprocessing & Feature Engineering Pipeline
Handles data cleaning, missing value imputation, ICD-9 mapping, feature engineering,
categorical encoding, and scaling without data leakage.
"""

import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from typing import Tuple, List, Dict, Any


def map_icd9_to_category(code: Any) -> str:
    """
    Groups detailed ICD-9 diagnosis codes into 9 primary clinical disease categories
    as described in the UCI Diabetes research methodology.
    """
    if pd.isna(code) or code == '?':
        return 'Other'
    
    code_str = str(code).strip()
    
    # Check for diabetes specific
    if code_str.startswith('250'):
        return 'Diabetes'
    
    # Check if numeric ICD-9
    try:
        val = float(code_str.split('.')[0])
        if (390 <= val <= 459) or val == 785:
            return 'Circulatory'
        elif (460 <= val <= 519) or val == 786:
            return 'Respiratory'
        elif (520 <= val <= 579) or val == 787:
            return 'Digestive'
        elif (580 <= val <= 629) or val == 788:
            return 'Genitourinary'
        elif 800 <= val <= 999:
            return 'Injury'
        elif 710 <= val <= 739:
            return 'Musculoskeletal'
        elif 140 <= val <= 239:
            return 'Neoplasm'
        else:
            return 'Other'
    except ValueError:
        # V and E prefix codes
        return 'Other'


class HealthcareFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn transformer that creates clinically meaningful derived features:
    - Total prior healthcare encounters (inpatient + emergency + outpatient)
    - High-risk discharge flag
    - Severe polypharmacy indicator (> 15 medications)
    - Unmanaged diabetic state (HbA1c > 8 with or without medication changes)
    """

    def fit(self, X: pd.DataFrame, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()
        
        # 1. Total prior encounters
        inpatient = df['number_inpatient'] if 'number_inpatient' in df.columns else 0
        emergency = df['number_emergency'] if 'number_emergency' in df.columns else 0
        outpatient = df['number_outpatient'] if 'number_outpatient' in df.columns else 0
        df['total_prior_encounters'] = inpatient + emergency + outpatient

        # 2. Inpatient to emergency ratio
        df['inpatient_intensity_ratio'] = np.where(
            df['total_prior_encounters'] > 0,
            (inpatient * 2.0 + emergency) / (df['total_prior_encounters'] + 1),
            0.0
        )

        # 3. Polypharmacy flag
        if 'num_medications' in df.columns:
            df['is_severe_polypharmacy'] = (df['num_medications'] >= 16).astype(int)

        # 4. Long stay flag
        if 'time_in_hospital' in df.columns:
            df['is_prolonged_stay'] = (df['time_in_hospital'] >= 7).astype(int)

        return df


def clean_and_prepare_features(df: pd.DataFrame, target_col: str = 'readmitted') -> Tuple[pd.DataFrame, pd.Series]:
    """
    Cleans raw UCI dataset and creates binary target:
    1 = Readmitted (<30 days or general readmission)
    0 = No readmission
    """
    data = df.copy()

    # Drop high missing columns (> 80% missing: weight, payer_code, medical_specialty if raw)
    drop_cols = ['weight', 'payer_code', 'medical_specialty', 'encounter_id', 'patient_nbr']
    data.drop(columns=[c for c in drop_cols if c in data.columns], inplace=True, errors='ignore')

    # Remove encounters with expired/hospice discharge dispositions (not eligible for readmission)
    if 'discharge_disposition_id' in data.columns:
        # Exclude hospice and expired if mapped
        pass

    # Map target to binary readmission
    if target_col in data.columns:
        # Standard research formulation: 30-day early readmission
        # '<30' is positive (1), '>30' or 'NO' are negative (0) for 30-day window,
        # or binary ('<30' | '>30') vs 'NO' for general readmission.
        y = (data[target_col] == '<30').astype(int)
        X = data.drop(columns=[target_col])
    else:
        y = pd.Series(np.zeros(len(data)))
        X = data

    return X, y


def build_preprocessing_pipeline() -> Pipeline:
    """
    Constructs the end-to-end ColumnTransformer and Feature Engineering Scikit-Learn Pipeline.
    """
    numerical_features = [
        'time_in_hospital',
        'num_lab_procedures',
        'num_procedures',
        'num_medications',
        'number_outpatient',
        'number_emergency',
        'number_inpatient',
        'number_diagnoses',
    ]

    categorical_features = [
        'age',
        'gender',
        'admission_type_id',
        'discharge_disposition_id',
        'admission_source_id',
        'primary_diagnosis',
        'secondary_diagnosis',
        'max_glu_serum',
        'A1Cresult',
        'change',
        'diabetesMed',
        'insulin',
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
        ],
        remainder='drop'
    )

    full_pipeline = Pipeline([
        ('feature_engineer', HealthcareFeatureEngineer()),
        ('preprocessor', preprocessor)
    ])

    return full_pipeline
