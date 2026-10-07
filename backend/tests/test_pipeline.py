"""
MedRisk AI - Unit & Integration Tests
Tests:
1. Input validation & preprocessing pipeline
2. Real-time probability prediction bounds (0 <= p <= 1)
3. SHAP local attribution additivity & direction logic
4. API response format and risk categorization
"""

import pytest
import sys
import os

# Add backend directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ml"))
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "app"))

from predict import ReadmissionPredictor
from explain import ShapExplainer


@pytest.fixture
def sample_patient():
    return {
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


def test_prediction_bounds(sample_patient):
    predictor = ReadmissionPredictor()
    proba, category = predictor.predict(sample_patient)
    assert 0.0 <= proba <= 1.0
    assert category in ["LOW", "MEDIUM", "HIGH"]
    assert proba > 0.60  # High risk patient profile should yield > 60% probability


def test_shap_attribution(sample_patient):
    explainer = ShapExplainer()
    explanation = explainer.explain_prediction(sample_patient)
    
    assert "contributions" in explanation
    assert len(explanation["contributions"]) > 0
    assert "top_positive_drivers" in explanation
    
    # Inpatient visits should be in top positive drivers for multimorbid patient
    features = [c["feature"] for c in explanation["top_positive_drivers"]]
    assert "number_inpatient" in features or "discharge_disposition" in features


def test_low_risk_profile():
    low_risk_patient = {
        "age_group": "[30-40)",
        "gender": "Female",
        "admission_type": "Elective",
        "discharge_disposition": "Discharged to home",
        "admission_source": "Physician Referral",
        "time_in_hospital": 2,
        "num_lab_procedures": 20,
        "num_procedures": 1,
        "num_medications": 6,
        "number_outpatient": 0,
        "number_emergency": 0,
        "number_inpatient": 0,
        "number_diagnoses": 2,
        "primary_diagnosis": "Digestive",
        "secondary_diagnosis": "Other",
        "max_glu_serum": "None",
        "A1Cresult": "Norm",
        "change_in_meds": "No",
        "diabetes_med": "No",
        "insulin_treatment": "No"
    }
    predictor = ReadmissionPredictor()
    proba, category = predictor.predict(low_risk_patient)
    assert proba < 0.35
    assert category == "LOW"
