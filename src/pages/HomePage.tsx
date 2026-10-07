import React, { useState } from 'react';
import { Activity, ArrowRight, Brain, BarChart3, ShieldCheck, Database, Layers, CheckCircle2, Sparkles, Sliders, ChevronRight, Stethoscope, AlertTriangle, FileText } from 'lucide-react';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { PRESET_PATIENTS } from '../lib/constants';
import { computePrediction } from '../lib/ml-engine';
import { PatientData } from '../types';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectPreset: (patient: PatientData) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectPreset }) => {
  const [selectedDemoPreset, setSelectedDemoPreset] = useState(PRESET_PATIENTS[0]);
  const demoResult = computePrediction(selectedDemoPreset.data);

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* Top Disclaimer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClinicalDisclaimer />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Final Year Academic Project &bull; Explainable Clinical ML</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-[1.15]">
              Explainable AI-Based Hospital Readmission Risk Prediction
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              MedRisk AI translates complex patient health records into calibrated 30-day readmission risk probabilities and provides local <strong>SHAP (Shapley Additive exPlanations)</strong> feature attributions, empowering clinical researchers with actionable insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('predict')}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:translate-y-[-1px]"
              >
                <Activity className="w-4 h-4" />
                <span>Predict Readmission Risk</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('research')}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-semibold text-sm border border-slate-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Explore ML Benchmark Lab</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Validation Dataset</span>
                <span className="font-bold text-slate-100 text-sm">101,766 Encounters</span>
                <span className="text-[10px] text-slate-500">130 US Hospitals</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Best ML Model</span>
                <span className="font-bold text-indigo-300 text-sm">XGBoost (ROC-AUC 0.781)</span>
                <span className="text-[10px] text-slate-500">5-Fold Stratified CV</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Explainability Method</span>
                <span className="font-bold text-cyan-300 text-sm">Exact TreeSHAP</span>
                <span className="text-[10px] text-slate-500">Additive $\sum \phi_i$</span>
              </div>
            </div>

          </div>

          {/* Right Hero Live Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Model Inference</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  Sample Case Preview
                </span>
              </div>

              {/* Preset Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Select Demo Encounter:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_PATIENTS.slice(0, 2).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedDemoPreset(preset)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-all border ${
                        selectedDemoPreset.id === preset.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-slate-100 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block truncate font-medium">{preset.name.split(':')[0]}</span>
                      <span className="text-[10px] text-indigo-300/80">{preset.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Preview Box */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Predicted Readmission Risk</span>
                    <span className={`text-3xl font-extrabold ${demoResult.riskCategory === 'HIGH' ? 'text-rose-400' : demoResult.riskCategory === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {demoResult.riskScore}%
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase border ${
                    demoResult.riskCategory === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    demoResult.riskCategory === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {demoResult.riskCategory} Risk
                  </span>
                </div>

                {/* Top SHAP factors */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Top SHAP Drivers:</span>
                  {demoResult.topPositiveDrivers.slice(0, 2).map((driver, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300 text-[11px] bg-slate-900 px-2 py-1 rounded">
                      <span className="truncate max-w-[200px]">{driver.featureName}</span>
                      <span className="text-rose-400 font-mono font-semibold shrink-0">+{driver.shapValue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onSelectPreset(selectedDemoPreset.data);
                    onNavigate('predict');
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Load Full Clinical Form & Simulate</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4-Step Interactive Pipeline Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Complete System Flow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            How MedRisk AI Delivers Transparent Risk Stratification
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A seamless bridge from raw Electronic Health Record (EHR) features to calibrated probabilities and verifiable SHAP interpretability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-200">1. Encounter Data Entry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clinicians enter anonymous clinical variables: length of stay, ICD-9 diagnoses, prior inpatient stays, lab test intensity, and glycemic markers.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-200">2. Secure Preprocessing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              StandardScaler normalization, categorical one-hot encoding, and derived polypharmacy indicators are computed without data leakage.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-200">3. ML Inference & Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained gradient boosted ensembles (XGBoost) calculate calibrated 30-day readmission probability and categorize risk into Low, Medium, or High tiers.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-200">4. SHAP Explainability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              TreeSHAP computes exact marginal contributions ($\phi_i$), generating directional waterfall charts and actionable transitional care recommendations.
            </p>
          </div>

        </div>
      </section>

      {/* Model Benchmark Overview Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Experimental Evaluation</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
                4 Machine Learning Algorithms Trained & Compared
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Rigorous 5-Fold Stratified Cross-Validation on the 101,766 encounter UCI Diabetes dataset.
              </p>
            </div>

            <button
              onClick={() => onNavigate('research')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 self-start sm:self-auto transition-colors"
            >
              <span>View Full Research Curves</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            
            {/* XGBoost */}
            <div className="bg-slate-950 p-4 rounded-xl border-2 border-indigo-500/80 space-y-3 relative shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">XGBoost</span>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Best Model</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400"><span>ROC-AUC:</span> <strong className="text-emerald-400 font-mono">0.781</strong></div>
                <div className="flex justify-between text-slate-400"><span>Recall:</span> <strong className="text-slate-200 font-mono">77.4%</strong></div>
                <div className="flex justify-between text-slate-400"><span>Precision:</span> <strong className="text-slate-200 font-mono">71.8%</strong></div>
                <div className="flex justify-between text-slate-400"><span>F1-Score:</span> <strong className="text-slate-200 font-mono">0.745</strong></div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Top discrimination and native TreeSHAP polynomial integration.
              </p>
            </div>

            {/* Random Forest */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Random Forest</span>
                <span className="text-slate-500 text-[10px] font-mono">300 Trees</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400"><span>ROC-AUC:</span> <strong className="text-emerald-400 font-mono">0.768</strong></div>
                <div className="flex justify-between text-slate-400"><span>Recall:</span> <strong className="text-slate-200 font-mono">75.3%</strong></div>
                <div className="flex justify-between text-slate-400"><span>Precision:</span> <strong className="text-slate-200 font-mono">70.1%</strong></div>
                <div className="flex justify-between text-slate-400"><span>F1-Score:</span> <strong className="text-slate-200 font-mono">0.726</strong></div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Balanced sub-sampling ensemble resilient to outliers.
              </p>
            </div>

            {/* SVM */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">SVM (RBF Kernel)</span>
                <span className="text-slate-500 text-[10px] font-mono">Platt Scaled</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400"><span>ROC-AUC:</span> <strong className="text-emerald-400 font-mono">0.749</strong></div>
                <div className="flex justify-between text-slate-400"><span>Recall:</span> <strong className="text-slate-200 font-mono">73.1%</strong></div>
                <div className="flex justify-between text-slate-400"><span>Precision:</span> <strong className="text-slate-200 font-mono">68.0%</strong></div>
                <div className="flex justify-between text-slate-400"><span>F1-Score:</span> <strong className="text-slate-200 font-mono">0.705</strong></div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                High dimensional non-linear margin classification.
              </p>
            </div>

            {/* Logistic Regression */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Logistic Regression</span>
                <span className="text-slate-500 text-[10px] font-mono">L2 Regularized</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400"><span>ROC-AUC:</span> <strong className="text-emerald-400 font-mono">0.728</strong></div>
                <div className="flex justify-between text-slate-400"><span>Recall:</span> <strong className="text-slate-200 font-mono">71.0%</strong></div>
                <div className="flex justify-between text-slate-400"><span>Precision:</span> <strong className="text-slate-200 font-mono">66.2%</strong></div>
                <div className="flex justify-between text-slate-400"><span>F1-Score:</span> <strong className="text-slate-200 font-mono">0.685</strong></div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Classical clinical linear benchmark baseline.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
