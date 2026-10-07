import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { PredictionReportModal } from '../components/PredictionReportModal';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, AlertCircle, Share2, Sparkles, Sliders, ShieldCheck, HeartPulse } from 'lucide-react';

interface ResultPageProps {
  prediction: PredictionResult;
  onModifyInputs: () => void;
  onNavigate: (page: string) => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  prediction,
  onModifyInputs,
  onNavigate,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/explain/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prediction }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.narrative);
      }
    } catch (e) {
      console.warn("AI summary fallback:", e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Disclaimer */}
      <ClinicalDisclaimer compact />

      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onModifyInputs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Patient Inputs</span>
          </button>

          <span className="text-xs text-slate-500">
            Prediction ID: <span className="font-mono text-slate-400">{prediction.id}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Clinical Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Score Gauge + Encounter Snapshot + Risk Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Risk Gauge Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Model Predicted 30-Day Readmission Risk
          </span>

          <RiskGauge
            score={prediction.riskScore}
            tier={prediction.riskCategory}
            confidenceInterval={prediction.confidenceInterval}
            lowMax={prediction.thresholdSettings?.lowMax || 30}
            mediumMax={prediction.thresholdSettings?.mediumMax || 70}
            size="lg"
          />

          <div className="mt-4 pt-4 border-t border-slate-800 w-full text-center">
            <span className="text-xs text-slate-400">
              Evaluated using: <strong className="text-slate-200">{prediction.modelUsed}</strong>
            </span>
          </div>
        </div>

        {/* Right: Key Contributing Clinical Factors & Plain-Language Summary */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-indigo-400" />
                Plain-Language Clinical Factor Explanation
              </h3>
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Decision Support
              </span>
            </div>

            <div className="space-y-2.5 mt-3 text-xs">
              {prediction.clinicalSummary.map((summaryText, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{summaryText}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Clinical Research Narrative synthesizer */}
          <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Automated Clinical Narrative Synthesis
              </span>
              {!aiSummary && (
                <button
                  onClick={fetchAiSummary}
                  disabled={loadingAi}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {loadingAi ? 'Synthesizing...' : 'Generate AI Narrative'}
                </button>
              )}
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">
              {aiSummary ||
                `The model identifies an overall ${prediction.riskCategory.toLowerCase()} readmission trajectory (${prediction.riskScore}%). Top risk amplification is driven by ${prediction.topPositiveDrivers[0]?.featureName.toLowerCase() || 'inpatient encounters'}, with protective modulation from short acute stabilization. Click "Generate AI Narrative" for deep clinical research synthesis.`}
            </p>
          </div>

          {/* Patient summary chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-3 border-t border-slate-800 text-slate-400">
            <div>
              <span className="block text-slate-500">Age Bracket:</span>
              <strong className="text-slate-200">{prediction.patientInput.age_group}</strong>
            </div>
            <div>
              <span className="block text-slate-500">Primary ICD-9:</span>
              <strong className="text-slate-200">{prediction.patientInput.primary_diagnosis}</strong>
            </div>
            <div>
              <span className="block text-slate-500">Inpatient Stays:</span>
              <strong className="text-slate-200">{prediction.patientInput.number_inpatient} in 12 mo.</strong>
            </div>
            <div>
              <span className="block text-slate-500">Length of Stay:</span>
              <strong className="text-slate-200">{prediction.patientInput.time_in_hospital} Days</strong>
            </div>
          </div>

        </div>

      </div>

      {/* SHAP Waterfall Attribution Visualizer */}
      <ShapWaterfallChart
        contributions={prediction.shapContributions}
        baseValue={prediction.baseValue}
        finalRiskScore={prediction.riskScore}
      />

      {/* Actionable Transitional Care Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Prioritized Transitional Care & Readmission Mitigation Checklist
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evidence-based care coordination touchpoints mapped to identified patient vulnerability drivers.
            </p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
            CMS HRRP Best Practice
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {prediction.preventiveRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-3 text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive What-If Simulator */}
      <WhatIfSimulator
        initialPatient={prediction.patientInput}
        initialResult={prediction}
      />

      {/* Export / Print Modal */}
      {showReportModal && (
        <PredictionReportModal
          prediction={prediction}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
};
