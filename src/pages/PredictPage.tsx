import React, { useState } from 'react';
import { PatientData, PredictionResult } from '../types';
import { AGE_GROUPS, ADMISSION_TYPES, DISCHARGE_DISPOSITIONS, ADMISSION_SOURCES, DIAGNOSES_CATEGORIES, PRESET_PATIENTS, DEFAULT_PATIENT } from '../lib/constants';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { computePrediction } from '../lib/ml-engine';
import { Activity, Sparkles, Sliders, RotateCcw, ArrowRight, ShieldAlert, Info, HelpCircle, Check, Settings2, Stethoscope, AlertCircle } from 'lucide-react';

interface PredictPageProps {
  initialPatient?: PatientData;
  onPredictionComplete: (result: PredictionResult) => void;
  token?: string | null;
}

export const PredictPage: React.FC<PredictPageProps> = ({
  initialPatient,
  onPredictionComplete,
  token,
}) => {
  const [formData, setFormData] = useState<PatientData>(initialPatient || DEFAULT_PATIENT);
  const [selectedModel, setSelectedModel] = useState<'XGBoost (Selected Best)' | 'Random Forest' | 'Logistic Regression' | 'Support Vector Machine'>('XGBoost (Selected Best)');
  const [thresholds, setThresholds] = useState({ lowMax: 30, mediumMax: 70 });
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof PatientData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyPreset = (presetData: PatientData) => {
    setFormData({ ...presetData });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (formData.time_in_hospital < 1 || formData.time_in_hospital > 14) {
      errs.time_in_hospital = 'Time in hospital must be between 1 and 14 days';
    }
    if (formData.num_lab_procedures < 1 || formData.num_lab_procedures > 132) {
      errs.num_lab_procedures = 'Lab procedures count must be between 1 and 132';
    }
    if (formData.num_medications < 1 || formData.num_medications > 81) {
      errs.num_medications = 'Medications count must be between 1 and 81';
    }
    if (formData.number_diagnoses < 1 || formData.number_diagnoses > 16) {
      errs.number_diagnoses = 'Number of diagnoses must be between 1 and 16';
    }
    if (formData.number_inpatient < 0 || formData.number_inpatient > 25) {
      errs.number_inpatient = 'Inpatient stays must be non-negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Call backend API /api/predict
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patient: formData,
          model: selectedModel,
          thresholds,
        }),
      });

      if (res.ok) {
        const result: PredictionResult = await res.json();
        onPredictionComplete(result);
      } else {
        // Fallback to client-side ML engine
        const fallbackResult = computePrediction(formData, selectedModel, thresholds);
        onPredictionComplete(fallbackResult);
      }
    } catch (err) {
      // Offline fallback
      const fallbackResult = computePrediction(formData, selectedModel, thresholds);
      onPredictionComplete(fallbackResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="space-y-4">
        <ClinicalDisclaimer compact />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <Stethoscope className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                Hospital Readmission Risk Predictor
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter inpatient encounter features supported by the trained ML pipeline (UCI Diabetes 130-US dataset).
            </p>
          </div>

          {/* Model Selector & Threshold Config button */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e: any) => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              <option value="XGBoost (Selected Best)">XGBoost (Selected Best &bull; AUC 0.781)</option>
              <option value="Random Forest">Random Forest (AUC 0.768)</option>
              <option value="Logistic Regression">Logistic Regression (L2 &bull; AUC 0.728)</option>
              <option value="Support Vector Machine">SVM (RBF Kernel &bull; AUC 0.749)</option>
            </select>

            <button
              type="button"
              onClick={() => setShowThresholdModal(!showThresholdModal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Thresholds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Modal / Drawer */}
      {showThresholdModal && (
        <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-3 text-xs shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              Configurable Research Risk Stratification Thresholds
            </span>
            <button
              onClick={() => setShowThresholdModal(false)}
              className="text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-slate-400 text-[11px]">
            Adjust the probabilistic cutoff boundaries defining Low, Medium, and High readmission categories for clinical sensitivity analysis.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1">Low-to-Medium Cutoff: <strong>{thresholds.lowMax}%</strong></label>
              <input
                type="range"
                min="10"
                max="50"
                value={thresholds.lowMax}
                onChange={(e) => setThresholds({ ...thresholds, lowMax: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Medium-to-High Cutoff: <strong>{thresholds.mediumMax}%</strong></label>
              <input
                type="range"
                min="50"
                max="90"
                value={thresholds.mediumMax}
                onChange={(e) => setThresholds({ ...thresholds, mediumMax: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets Toolbar */}
      <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick Encounter Presets (1-Click Load)
          </span>
          <span className="text-[10px] text-slate-500">Representative validation cohorts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_PATIENTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.data)}
              className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                  {preset.name.split(':')[0]}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* GROUP 1: Demographics & Admission */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-100">Patient Demographics & Admission Dynamics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Age Group */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Age Demographic Group</label>
              <select
                value={formData.age_group}
                onChange={(e) => handleFieldChange('age_group', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag}>{ag} years old</option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Biological Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Unknown">Unknown / Other</option>
              </select>
            </div>

            {/* Admission Type */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Admission Urgency / Type</label>
              <select
                value={formData.admission_type}
                onChange={(e) => handleFieldChange('admission_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ADMISSION_TYPES.map((at) => (
                  <option key={at} value={at}>{at}</option>
                ))}
              </select>
            </div>

            {/* Admission Source */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Admission Source</label>
              <select
                value={formData.admission_source}
                onChange={(e) => handleFieldChange('admission_source', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ADMISSION_SOURCES.map((as) => (
                  <option key={as} value={as}>{as}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* GROUP 2: Inpatient Stay & Discharge Disposition */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-md bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-100">Inpatient Length of Stay & Post-Acute Disposition</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Length of stay */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Time in Hospital (Length of Stay)</label>
                <span className="font-mono font-bold text-indigo-400">{formData.time_in_hospital} Days</span>
              </div>
              <input
                type="number"
                min="1"
                max="14"
                value={formData.time_in_hospital}
                onChange={(e) => handleFieldChange('time_in_hospital', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.time_in_hospital && (
                <span className="text-rose-400 text-[10px] mt-1 block">{errors.time_in_hospital}</span>
              )}
            </div>

            {/* Discharge disposition */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Discharge Destination / Disposition</label>
              <select
                value={formData.discharge_disposition}
                onChange={(e) => handleFieldChange('discharge_disposition', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DISCHARGE_DISPOSITIONS.map((dd) => (
                  <option key={dd} value={dd}>{dd}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* GROUP 3: Diagnostic Complexity & Lab Intensity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-100">Diagnostic Complexity & Laboratory Testing</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Primary Diagnosis */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Admitting Diagnosis (ICD-9 Group)</label>
              <select
                value={formData.primary_diagnosis}
                onChange={(e) => handleFieldChange('primary_diagnosis', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DIAGNOSES_CATEGORIES.map((dc) => (
                  <option key={dc.id} value={dc.id}>{dc.label}</option>
                ))}
              </select>
            </div>

            {/* Secondary Diagnosis */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Secondary Comorbid Diagnosis</label>
              <select
                value={formData.secondary_diagnosis}
                onChange={(e) => handleFieldChange('secondary_diagnosis', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DIAGNOSES_CATEGORIES.map((dc) => (
                  <option key={dc.id} value={dc.id}>{dc.label}</option>
                ))}
              </select>
            </div>

            {/* Number of Diagnoses */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Total Diagnoses Entered</label>
                <span className="font-mono font-bold text-indigo-400">{formData.number_diagnoses} Diagnoses</span>
              </div>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.number_diagnoses}
                onChange={(e) => handleFieldChange('number_diagnoses', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Lab procedures count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Diagnostic Lab Procedures Count</label>
                <span className="font-mono font-bold text-indigo-400">{formData.num_lab_procedures} Tests</span>
              </div>
              <input
                type="number"
                min="1"
                max="132"
                value={formData.num_lab_procedures}
                onChange={(e) => handleFieldChange('num_lab_procedures', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Non-lab procedures */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Non-Lab Surgical / Clinical Procedures</label>
                <span className="font-mono font-bold text-indigo-400">{formData.num_procedures} Procedures</span>
              </div>
              <input
                type="number"
                min="0"
                max="6"
                value={formData.num_procedures}
                onChange={(e) => handleFieldChange('num_procedures', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* GROUP 4: Preceding 12-Month Encounter History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-100">Prior 12-Month Encounter Utilization History</h3>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Primary SHAP Risk Driver
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Inpatient Stays */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-200 font-bold">Prior Inpatient Admissions</label>
                <span className="font-mono font-bold text-rose-400">{formData.number_inpatient}</span>
              </div>
              <input
                type="number"
                min="0"
                max="20"
                value={formData.number_inpatient}
                onChange={(e) => handleFieldChange('number_inpatient', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Inpatient stays in past year</span>
            </div>

            {/* Emergency Visits */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-200 font-bold">Prior Emergency Department Visits</label>
                <span className="font-mono font-bold text-amber-400">{formData.number_emergency}</span>
              </div>
              <input
                type="number"
                min="0"
                max="40"
                value={formData.number_emergency}
                onChange={(e) => handleFieldChange('number_emergency', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">ED visits in past year</span>
            </div>

            {/* Outpatient Visits */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-200 font-bold">Prior Outpatient Clinic Visits</label>
                <span className="font-mono font-bold text-indigo-400">{formData.number_outpatient}</span>
              </div>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.number_outpatient}
                onChange={(e) => handleFieldChange('number_outpatient', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Scheduled ambulatory visits</span>
            </div>
          </div>
        </div>

        {/* GROUP 5: Glycemic Control & Pharmacology */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded-md bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-xs">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-100">Glycemic Control & Medication Titration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* HbA1c */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">HbA1c Lab Result</label>
              <select
                value={formData.A1Cresult}
                onChange={(e) => handleFieldChange('A1Cresult', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="None">None (Not Measured During Stay)</option>
                <option value="Norm">Norm (&lt; 7.0% Controlled)</option>
                <option value=">7">&gt;7.0% (Mildly Elevated)</option>
                <option value=">8">&gt;8.0% (Severely Elevated / Uncontrolled)</option>
              </select>
            </div>

            {/* Max glucose serum */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Glucose Serum</label>
              <select
                value={formData.max_glu_serum}
                onChange={(e) => handleFieldChange('max_glu_serum', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="None">None (Not Measured)</option>
                <option value="Norm">Norm (&lt; 200 mg/dL)</option>
                <option value=">200">&gt; 200 mg/dL</option>
                <option value=">300">&gt; 300 mg/dL (Acute Hyperglycemia)</option>
              </select>
            </div>

            {/* Prescribed Medications Count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">Distinct Medications Prescribed</label>
                <span className="font-mono font-bold text-indigo-400">{formData.num_medications} Meds</span>
              </div>
              <input
                type="number"
                min="1"
                max="81"
                value={formData.num_medications}
                onChange={(e) => handleFieldChange('num_medications', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Insulin Status */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Insulin Treatment / Dosage</label>
              <select
                value={formData.insulin_treatment}
                onChange={(e) => handleFieldChange('insulin_treatment', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="No">No (No Insulin Prescribed)</option>
                <option value="Steady">Steady (Maintained Dosage)</option>
                <option value="Up">Up (Inpatient Dosage Increased)</option>
                <option value="Down">Down (Inpatient Dosage Decreased)</option>
              </select>
            </div>

            {/* Change in medications */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Change in Diabetic Medications</label>
              <select
                value={formData.change_in_meds}
                onChange={(e) => handleFieldChange('change_in_meds', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="No">No (No Change to Regimen)</option>
                <option value="Ch">Ch (Active Inpatient Regimen Change)</option>
              </select>
            </div>

            {/* Prescribed diabetes med */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Any Diabetes Medication Prescribed</label>
              <select
                value={formData.diabetes_med}
                onChange={(e) => handleFieldChange('diabetes_med', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setFormData(DEFAULT_PATIENT)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Standard Patient</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xl shadow-indigo-600/30 transition-all w-full sm:w-auto justify-center hover:scale-[1.01]"
          >
            <Activity className="w-4 h-4" />
            <span>{isSubmitting ? 'Calculating SHAP Attributions...' : 'Generate 30-Day Readmission Risk & XAI Explanation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
