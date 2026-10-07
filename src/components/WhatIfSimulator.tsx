import React, { useState } from 'react';
import { PatientData, PredictionResult } from '../types';
import { computePrediction } from '../lib/ml-engine';
import { Sliders, RefreshCw, TrendingDown, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface WhatIfSimulatorProps {
  initialPatient: PatientData;
  initialResult: PredictionResult;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialPatient,
  initialResult,
}) => {
  const [modifiedPatient, setModifiedPatient] = useState<PatientData>({ ...initialPatient });
  const [simulatedResult, setSimulatedResult] = useState<PredictionResult>(initialResult);

  const handleUpdate = (field: keyof PatientData, value: any) => {
    const updated = { ...modifiedPatient, [field]: value };
    setModifiedPatient(updated);
    const newPrediction = computePrediction(updated, initialResult.modelUsed);
    setSimulatedResult(newPrediction);
  };

  const handleReset = () => {
    setModifiedPatient({ ...initialPatient });
    setSimulatedResult(initialResult);
  };

  const riskDelta = simulatedResult.riskScore - initialResult.riskScore;
  const isReduced = riskDelta < -0.1;
  const isIncreased = riskDelta > 0.1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Interactive What-If & Intervention Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how post-discharge interventions and length-of-stay modifications alter the model’s predicted readmission risk.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Baseline
        </button>
      </div>

      {/* Real-time Delta Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center sm:text-left">
        <div>
          <span className="text-xs text-slate-400 block">Baseline Encounter Risk</span>
          <span className="text-xl font-bold text-slate-200">{initialResult.riskScore}%</span>
          <span className="text-[11px] text-slate-500 block uppercase font-mono">{initialResult.riskCategory}</span>
        </div>

        <div>
          <span className="text-xs text-slate-400 block">Simulated Post-Intervention</span>
          <span className={`text-xl font-bold ${simulatedResult.riskCategory === 'HIGH' ? 'text-rose-400' : simulatedResult.riskCategory === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
            {simulatedResult.riskScore}%
          </span>
          <span className="text-[11px] text-slate-400 block uppercase font-mono">{simulatedResult.riskCategory}</span>
        </div>

        <div className="flex flex-col justify-center items-center sm:items-start">
          <span className="text-xs text-slate-400 block">Estimated Risk Delta ($\Delta$)</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isReduced ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-lg">
                <TrendingDown className="w-5 h-5" />
                {riskDelta.toFixed(1)}%
              </span>
            ) : isIncreased ? (
              <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-lg">
                <TrendingUp className="w-5 h-5" />
                +{riskDelta.toFixed(1)}%
              </span>
            ) : (
              <span className="text-slate-400 font-bold text-lg">0.0% (No Change)</span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Discharge Destination */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <label className="font-medium text-slate-300 flex items-center justify-between">
            <span>Discharge Destination & Transitional Support</span>
            <span className="text-slate-400 font-mono text-[11px]">{modifiedPatient.discharge_disposition}</span>
          </label>
          <select
            value={modifiedPatient.discharge_disposition}
            onChange={(e) => handleUpdate('discharge_disposition', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Discharged to home">Discharged to home (Routine baseline)</option>
            <option value="Discharged/transferred to home with home health service">Discharged home with Home Health Support</option>
            <option value="Discharged/transferred to SNF (Skilled Nursing Facility)">Transferred to Skilled Nursing Facility (SNF)</option>
            <option value="Discharged/transferred to inpatient care / Rehab">Transferred to Inpatient Rehab</option>
            <option value="Left AMA (Against Medical Advice)">Left AMA (Against Medical Advice)</option>
          </select>
        </div>

        {/* Glycemic Status / HbA1c */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <label className="font-medium text-slate-300 flex items-center justify-between">
            <span>Glycemic Control & Inpatient HbA1c</span>
            <span className="text-slate-400 font-mono text-[11px]">HbA1c: {modifiedPatient.A1Cresult}</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(['Norm', '>7', '>8', 'None'] as const).map((a1c) => (
              <button
                key={a1c}
                type="button"
                onClick={() => handleUpdate('A1Cresult', a1c)}
                className={`py-1.5 rounded text-[11px] font-medium border transition-all ${
                  modifiedPatient.A1Cresult === a1c
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {a1c === 'Norm' ? '<7 (Norm)' : a1c}
              </button>
            ))}
          </div>
        </div>

        {/* Length of stay Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between font-medium text-slate-300">
            <span>Hospital Length of Stay</span>
            <span className="font-mono text-indigo-300 text-sm font-bold">{modifiedPatient.time_in_hospital} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="14"
            value={modifiedPatient.time_in_hospital}
            onChange={(e) => handleUpdate('time_in_hospital', Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 Day (Short)</span>
            <span>7 Days</span>
            <span>14 Days (Extended)</span>
          </div>
        </div>

        {/* Medication count Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between font-medium text-slate-300">
            <span>Prescribed Medication Count (Polypharmacy)</span>
            <span className="font-mono text-indigo-300 text-sm font-bold">{modifiedPatient.num_medications} Meds</span>
          </div>
          <input
            type="range"
            min="1"
            max="45"
            value={modifiedPatient.num_medications}
            onChange={(e) => handleUpdate('num_medications', Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>5 (Low)</span>
            <span>16 (Moderate)</span>
            <span>45+ (Severe Polypharmacy)</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      {isReduced && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Positive Risk Mitigation:</strong> The simulated adjustments (e.g. glycemic stabilization or discharge optimization) reduced predicted 30-day readmission risk by <strong>{Math.abs(riskDelta).toFixed(1)} percentage points</strong>.
          </span>
        </div>
      )}
    </div>
  );
};
