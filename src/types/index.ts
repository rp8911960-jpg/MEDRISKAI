export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PatientData {
  age_group: string; // e.g. '[60-70)'
  gender: 'Male' | 'Female' | 'Unknown';
  admission_type: string; // 'Emergency' | 'Urgent' | 'Elective' | 'Trauma Center' | 'Other'
  discharge_disposition: string; // 'Home' | 'SNF' | 'Home Health' | 'Rehab' | 'AMA' | 'Other/Hospice'
  admission_source: string; // 'Emergency Room' | 'Physician Referral' | 'Clinic Referral' | 'Transfer' | 'Other'
  time_in_hospital: number; // 1 - 14 days
  num_lab_procedures: number; // 1 - 132
  num_procedures: number; // 0 - 6
  num_medications: number; // 1 - 81
  number_outpatient: number; // 0 - 40
  number_emergency: number; // 0 - 60
  number_inpatient: number; // 0 - 20
  number_diagnoses: number; // 1 - 16
  primary_diagnosis: string; // 'Circulatory' | 'Diabetes' | 'Respiratory' | 'Digestive' | 'Injury' | 'Musculoskeletal' | 'Genitourinary' | 'Neoplasm' | 'Other'
  secondary_diagnosis: string;
  max_glu_serum: 'None' | 'Norm' | '>200' | '>300';
  A1Cresult: 'None' | 'Norm' | '>7' | '>8';
  change_in_meds: 'No' | 'Ch'; // change in medications
  diabetes_med: 'No' | 'Yes';
  insulin_treatment: 'No' | 'Steady' | 'Up' | 'Down';
}

export interface ShapContribution {
  feature: string;
  featureName: string;
  featureValue: string | number;
  shapValue: number; // Log-odds or probability contribution
  direction: 'increases_risk' | 'decreases_risk' | 'neutral';
  impactPercentage: number;
  explanation: string;
  clinicalContext: string;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  patientInput: PatientData;
  modelUsed: 'XGBoost (Selected Best)' | 'Random Forest' | 'Logistic Regression' | 'Support Vector Machine';
  riskProbability: number; // 0.00 to 1.00 (e.g. 0.784 = 78.4%)
  riskScore: number; // 0 to 100
  riskCategory: RiskTier;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  baseValue: number; // Model expected baseline (e.g. 0.418)
  shapContributions: ShapContribution[];
  topPositiveDrivers: ShapContribution[];
  topNegativeDrivers: ShapContribution[];
  clinicalSummary: string[];
  preventiveRecommendations: string[];
  thresholdSettings: {
    lowMax: number;
    mediumMax: number;
  };
}

export interface ModelMetricDetails {
  id: string;
  name: string;
  isBestModel: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  trainingTimeSec: number;
  inferenceLatencyMs: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  rocCurve: Array<{ fpr: number; tpr: number; threshold: number }>;
  prCurve: Array<{ precision: number; recall: number; threshold: number }>;
  calibrationCurve: Array<{ meanPredictedValue: number; fractionOfPositives: number }>;
  topFeatures: Array<{ feature: string; importance: number; description: string }>;
  description: string;
  advantages: string[];
  tradeoffs: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'clinician' | 'researcher' | 'admin' | 'guest';
  institution?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalPredictions: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  averageRiskScore: number;
  recentTrends: Array<{
    date: string;
    total: number;
    highRisk: number;
    avgScore: number;
  }>;
  ageDistribution: Array<{
    ageGroup: string;
    low: number;
    medium: number;
    high: number;
  }>;
  primaryDiagnosisBreakdown: Array<{
    diagnosis: string;
    count: number;
    avgRisk: number;
  }>;
  admissionSourceImpact: Array<{
    source: string;
    readmissionRate: number;
    sampleSize: number;
  }>;
}

export interface HistoryRecord {
  id: string;
  userId?: string;
  timestamp: string;
  patientSummary: {
    age_group: string;
    gender: string;
    time_in_hospital: number;
    primary_diagnosis: string;
    number_inpatient: number;
    number_emergency: number;
  };
  modelUsed: string;
  riskProbability: number;
  riskCategory: RiskTier;
  topFactor: string;
  fullData: PredictionResult;
}
