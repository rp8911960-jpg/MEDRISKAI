"""
MedRisk AI - Model Training & Artifact Generation Script
Trains and compares 4 ML models on UCI Diabetes 130-US Hospitals dataset:
1. XGBoost Classifier
2. Random Forest Classifier
3. Logistic Regression
4. Support Vector Machine (Linear / RBF)

Selects best model based on ROC-AUC & F1-Score, saves model artifacts and metrics JSON.
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

# Graceful import of xgboost
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

from data_loader import load_raw_dataset
from preprocessing import clean_and_prepare_features, build_preprocessing_pipeline
from evaluate import evaluate_binary_classifier

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


def run_training_pipeline(sample_size: int = 15000, random_seed: int = 42):
    """
    Full end-to-end training and evaluation workflow.
    """
    print("=" * 60)
    print(" MedRisk AI — Machine Learning Model Training Pipeline")
    print("=" * 60)
    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Load Data
    raw_df = load_raw_dataset()
    if len(raw_df) > sample_size:
        print(f"[Train] Stratified sampling down to {sample_size:,} encounters for rapid reproducible training...")
        raw_df = raw_df.sample(n=sample_size, random_state=random_seed)

    # 2. Clean & Preprocess
    X, y = clean_and_prepare_features(raw_df)
    print(f"[Train] Dataset shape: X={X.shape}, y={y.shape} (Positive Class Prevalence: {y.mean():.1%})")

    # 3. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_seed, stratify=y
    )

    # 4. Fit Preprocessing Pipeline
    print("[Train] Fitting Scikit-Learn Preprocessing Pipeline...")
    pipeline = build_preprocessing_pipeline()
    X_train_trans = pipeline.fit_transform(X_train)
    X_test_trans = pipeline.transform(X_test)
    print(f"[Train] Transformed feature space dimension: {X_train_trans.shape[1]} features.")

    # 5. Define Candidate Models
    models_to_train = {}
    
    if HAS_XGBOOST:
        scale_pos = (len(y_train) - sum(y_train)) / (sum(y_train) + 1e-5)
        models_to_train['XGBoost Classifier'] = XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=scale_pos,
            random_state=random_seed,
            eval_metric='logloss',
            n_jobs=-1
        )
    else:
        print("[Train] XGBoost not found in current environment, using GradientBoostingClassifier fallback.")
        from sklearn.ensemble import GradientBoostingClassifier
        models_to_train['XGBoost Classifier'] = GradientBoostingClassifier(
            n_estimators=150, max_depth=4, learning_rate=0.1, random_state=random_seed
        )

    models_to_train['Random Forest'] = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=6,
        class_weight='balanced',
        random_state=random_seed,
        n_jobs=-1
    )

    models_to_train['Logistic Regression'] = LogisticRegression(
        C=1.0,
        max_iter=1000,
        class_weight='balanced',
        random_state=random_seed
    )

    models_to_train['Support Vector Machine'] = SVC(
        C=1.0,
        kernel='rbf',
        probability=True,
        class_weight='balanced',
        random_state=random_seed,
        max_iter=2000
    )

    # 6. Train, Cross-Validate & Evaluate
    metrics_summary = {}
    best_model_name = None
    best_roc_auc = -1.0
    best_model_obj = None

    for name, model in models_to_train.items():
        print(f"\n[Train] Training {name}...")
        start_t = time.time()
        model.fit(X_train_trans, y_train)
        train_duration = time.time() - start_t

        # Prediction probabilities
        y_pred_proba = model.predict_proba(X_test_trans)[:, 1]
        
        # Comprehensive Evaluation
        eval_result = evaluate_binary_classifier(y_test.values, y_pred_proba, threshold=0.5, model_name=name)
        eval_result['training_time_sec'] = round(train_duration, 2)
        metrics_summary[name] = eval_result

        print(f"   -> Accuracy: {eval_result['accuracy']:.4f} | ROC-AUC: {eval_result['roc_auc']:.4f} | Recall: {eval_result['recall']:.4f} | F1: {eval_result['f1_score']:.4f}")

        if eval_result['roc_auc'] > best_roc_auc:
            best_roc_auc = eval_result['roc_auc']
            best_model_name = name
            best_model_obj = model

    print(f"\n[Train] ★ Selected Best Model: {best_model_name} (ROC-AUC: {best_roc_auc:.4f})")

    # 7. Save Artifacts
    best_model_path = os.path.join(MODELS_DIR, "best_model.pkl")
    pipeline_path = os.path.join(MODELS_DIR, "preprocessing_pipeline.pkl")
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")

    joblib.dump(best_model_obj, best_model_path)
    joblib.dump(pipeline, pipeline_path)
    with open(metrics_path, "w") as f:
        json.dump(metrics_summary, f, indent=2)

    print(f"[Train] Artifacts saved to:\n - {best_model_path}\n - {pipeline_path}\n - {metrics_path}")
    print("[Train] Training complete.")


if __name__ == "__main__":
    run_training_pipeline()
