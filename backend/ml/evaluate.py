"""
MedRisk AI - Evaluation & Metrics Calculation Module
Calculates standard healthcare machine learning metrics:
Accuracy, Precision, Recall (Sensitivity), Specificity, F1-Score, ROC-AUC, PR-AUC, Brier Score,
Confusion Matrix, ROC curves, Precision-Recall curves, and Calibration Curves.
"""

import json
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
)
from sklearn.calibration import calibration_curve
from typing import Dict, Any


def evaluate_binary_classifier(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    threshold: float = 0.5,
    model_name: str = "Model"
) -> Dict[str, Any]:
    """
    Computes all standard clinical performance metrics and curve coordinate points.
    """
    y_pred = (y_pred_proba >= threshold).astype(int)

    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    
    try:
        roc_auc = float(roc_auc_score(y_true, y_pred_proba))
    except Exception:
        roc_auc = 0.5
        
    try:
        pr_auc = float(average_precision_score(y_true, y_pred_proba))
    except Exception:
        pr_auc = float(np.mean(y_true))
        
    brier = float(brier_score_loss(y_true, y_pred_proba))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    # ROC curve points (sampled for serialization)
    fpr, tpr, roc_thresh = roc_curve(y_true, y_pred_proba)
    indices = np.linspace(0, len(fpr) - 1, min(15, len(fpr))).astype(int)
    roc_points = [
        {"fpr": round(float(fpr[i]), 3), "tpr": round(float(tpr[i]), 3), "threshold": round(float(roc_thresh[i]), 3)}
        for i in indices
    ]

    # PR curve points
    pr_precision, pr_recall, pr_thresh = precision_recall_curve(y_true, y_pred_proba)
    pr_indices = np.linspace(0, len(pr_recall) - 1, min(12, len(pr_recall))).astype(int)
    pr_points = [
        {"precision": round(float(pr_precision[i]), 3), "recall": round(float(pr_recall[i]), 3)}
        for i in pr_indices
    ]

    # Calibration curve
    try:
        prob_true, prob_pred = calibration_curve(y_true, y_pred_proba, n_bins=5, strategy='uniform')
        calib_points = [
            {"meanPredictedValue": round(float(prob_pred[i]), 3), "fractionOfPositives": round(float(prob_true[i]), 3)}
            for i in range(len(prob_true))
        ]
    except Exception:
        calib_points = []

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "specificity": round(specificity, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": {
            "true_positive": int(tp),
            "false_positive": int(fp),
            "true_negative": int(tn),
            "false_negative": int(fn)
        },
        "roc_curve": roc_points,
        "pr_curve": pr_points,
        "calibration_curve": calib_points
    }
