import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, FileJson, Server, Key, ArrowRight } from 'lucide-react';
import { DEFAULT_PATIENT } from '../lib/constants';

export const ApiDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'predict' | 'models' | 'stats' | 'auth'>('predict');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const runLiveTest = async () => {
    setIsRunning(true);
    setTestResponse(null);
    try {
      if (activeTab === 'predict') {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient: DEFAULT_PATIENT,
            model: 'XGBoost (Selected Best)',
          }),
        });
        const data = await res.json();
        setTestResponse(data);
      } else if (activeTab === 'models') {
        const res = await fetch('/api/models');
        const data = await res.json();
        setTestResponse(data);
      } else if (activeTab === 'stats') {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setTestResponse(data);
      }
    } catch (e: any) {
      setTestResponse({ error: e.message || 'API request failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const samplePredictCurl = `curl -X POST "http://localhost:3000/api/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "XGBoost (Selected Best)",
    "patient": {
      "age_group": "[70-80)",
      "gender": "Female",
      "time_in_hospital": 6,
      "primary_diagnosis": "Circulatory (Heart Failure / CAD)",
      "secondary_diagnosis": "Diabetes",
      "number_diagnoses": 9,
      "num_lab_procedures": 48,
      "num_procedures": 1,
      "num_medications": 18,
      "number_inpatient": 2,
      "number_emergency": 1,
      "number_outpatient": 0,
      "A1Cresult": ">8",
      "max_glu_serum": "None",
      "insulin_treatment": "Up",
      "change_in_meds": "Ch",
      "diabetes_med": "Yes",
      "admission_type": "Emergency",
      "discharge_disposition": "Discharged to home",
      "admission_source": "Emergency Room"
    }
  }'`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-100">
            MedRisk AI REST API Reference
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Programmatic interface for EHR integration, batch prediction, and SHAP interpretability pipelines.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'predict', label: 'POST /api/predict', desc: 'Risk & SHAP' },
          { id: 'models', label: 'GET /api/models', desc: 'Model Benchmarks' },
          { id: 'stats', label: 'GET /api/stats', desc: 'Cohort Analytics' },
          { id: 'auth', label: 'POST /api/auth/login', desc: 'JWT Authentication' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setTestResponse(null);
            }}
            className={`px-3.5 py-2 rounded-lg font-mono font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Endpoint Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Spec & Code Snippets */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-300">
                {activeTab === 'predict' && 'POST /api/predict'}
                {activeTab === 'models' && 'GET /api/models'}
                {activeTab === 'stats' && 'GET /api/stats'}
                {activeTab === 'auth' && 'POST /api/auth/login'}
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                HTTP 200 OK
              </span>
            </div>

            <p className="text-xs text-slate-300">
              {activeTab === 'predict' && 'Executes trained ML models (XGBoost/RF/LR/SVM) on encounter features and returns calibrated readmission probability along with exact TreeSHAP attributions.'}
              {activeTab === 'models' && 'Retrieves cross-validation performance metrics (ROC-AUC, Precision, Recall, F1) and hyperparameters for all 4 evaluated architectures.'}
              {activeTab === 'stats' && 'Returns aggregated population health metrics across the 101,766-encounter validation study.'}
              {activeTab === 'auth' && 'Authenticates clinician or researcher credentials and returns a secure JWT bearer token.'}
            </p>

            {/* cURL Snippet */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>cURL Request Example:</span>
                <button
                  onClick={() => handleCopy(samplePredictCurl, 'curl')}
                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                >
                  {copiedEndpoint === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEndpoint === 'curl' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {samplePredictCurl}
              </pre>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Sandbox / Response Viewer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Live API Sandbox Test Runner
              </h4>
              <button
                onClick={runLiveTest}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                <span>{isRunning ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 h-80 overflow-y-auto font-mono text-[11px] text-slate-300">
              {testResponse ? (
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                  <FileJson className="w-8 h-8 mb-2 opacity-50" />
                  <span>Click "Send Request" to execute live against the endpoint</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
