import React from 'react';
import { PredictionResult } from '../types';
import { X, Printer, Download, FileText, ShieldAlert, CheckCircle2, Hospital } from 'lucide-react';

interface PredictionReportModalProps {
  prediction: PredictionResult;
  onClose: () => void;
}

export const PredictionReportModal: React.FC<PredictionReportModalProps> = ({
  prediction,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prediction, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MedRisk_Report_${prediction.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-100">
        
        {/* Modal Top Actions */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Clinical Decision Support Report</h3>
              <p className="text-xs text-slate-400">ID: {prediction.id} | Generated {new Date(prediction.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 space-y-6 text-sm">
          
          {/* Header Banner */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Hospital className="w-4 h-4" />
                MedRisk AI Healthcare Decision Informatics
              </div>
              <h4 className="text-lg font-bold text-slate-100">
                30-Day Hospital Readmission Risk Assessment
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: <strong>{prediction.modelUsed}</strong> (Trained on UCI Diabetes 130-US Hospitals dataset)
              </p>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="text-3xl font-extrabold text-indigo-300">
                {prediction.riskScore}%
              </div>
              <span className={`inline-block text-xs uppercase font-bold px-2.5 py-0.5 rounded-full mt-1 border ${
                prediction.riskCategory === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                prediction.riskCategory === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {prediction.riskCategory} Risk Tier
              </span>
            </div>
          </div>

          {/* Patient Clinical Profile Snapshot */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Encounter Clinical Summary
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Age Demographic:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.age_group}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Gender:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.gender}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Length of Stay:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.time_in_hospital} Days</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Primary Diagnosis:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.primary_diagnosis}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Prior Inpatient Stays:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.number_inpatient} in 12 mo.</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Prior ED Visits:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.number_emergency} in 12 mo.</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">HbA1c Result:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.A1Cresult}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Medication Count:</span>
                <span className="font-semibold text-slate-200">{prediction.patientInput.num_medications} Distinct</span>
              </div>
            </div>
          </div>

          {/* Explainable AI Drivers Breakdown */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Explainable AI: Key SHAP Risk Attributions
            </h5>
            <div className="space-y-2">
              {prediction.topPositiveDrivers.map((driver, i) => (
                <div key={i} className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-3 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-rose-300 block">{driver.featureName}: {driver.featureValue}</span>
                    <p className="text-slate-300 mt-0.5">{driver.explanation}</p>
                  </div>
                  <span className="font-mono font-bold text-rose-400 shrink-0">+{driver.shapValue.toFixed(3)}</span>
                </div>
              ))}
              {prediction.topNegativeDrivers.map((driver, i) => (
                <div key={i} className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-emerald-300 block">{driver.featureName}: {driver.featureValue}</span>
                    <p className="text-slate-300 mt-0.5">{driver.explanation}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">{driver.shapValue.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Transitional Care Actions */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Targeted Transitional Care Checklist
            </h5>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              {prediction.preventiveRecommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Clinical Disclaimer in Report */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200/90 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Disclaimer for Clinical & Academic Use:</strong> This document is generated as probabilistic computational decision-support from retrospective data. It does not replace comprehensive physician clinical judgment, direct physical examination, or patient care directives.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
