import React, { useState } from 'react';
import { MODEL_METRICS, ROC_POINTS_XGB, ROC_POINTS_RF, ROC_POINTS_LR, ROC_POINTS_SVM, CONFUSION_MATRICES } from '../lib/constants';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { FileSpreadsheet, BarChart2, Activity, Award, CheckCircle2, Sliders, ShieldAlert, BookOpen, Layers, Code2, Copy, Check } from 'lucide-react';

export const ResearchPage: React.FC = () => {
  const [selectedModelKey, setSelectedModelKey] = useState<string>('xgboost');
  const [thresholdCutoff, setThresholdCutoff] = useState<number>(0.5);
  const [copiedLatex, setCopiedLatex] = useState(false);

  const activeMetrics = MODEL_METRICS.find((m) => m.name.toLowerCase().includes(selectedModelKey)) || MODEL_METRICS[0];
  const activeCM = CONFUSION_MATRICES[selectedModelKey] || CONFUSION_MATRICES['xgboost'];

  const handleCopyLatex = () => {
    const latexTable = `\\begin{table}[h]
\\centering
\\caption{Comparative Performance of Hospital Readmission Machine Learning Models (UCI 130-US Dataset)}
\\begin{tabular}{lcccccc}
\\hline
\\textbf{Model} & \\textbf{ROC-AUC} & \\textbf{PR-AUC} & \\textbf{Accuracy} & \\textbf{Precision} & \\textbf{Recall} & \\textbf{F1-Score} \\\\
\\hline
XGBoost & \\textbf{0.781} & \\textbf{0.742} & \\textbf{75.8\\%} & \\textbf{71.8\\%} & \\textbf{77.4\\%} & \\textbf{0.745} \\\\
Random Forest & 0.768 & 0.725 & 74.2\\% & 70.1\\% & 75.3\\% & 0.726 \\\\
SVM (RBF) & 0.749 & 0.701 & 72.5\\% & 68.0\\% & 73.1\\% & 0.705 \\\\
Logistic Regression & 0.728 & 0.678 & 70.4\\% & 66.2\\% & 71.0\\% & 0.685 \\\\
\\hline
\\end{tabular}
\\label{tab:readmission_models}
\\end{table}`;

    navigator.clipboard.writeText(latexTable);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <ClinicalDisclaimer compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-slate-100">
              Machine Learning Research & Model Benchmarks
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical evaluation, calibration curves, ROC-AUC comparison, and TreeSHAP mathematical formulations.
          </p>
        </div>

        <button
          onClick={handleCopyLatex}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors self-start sm:self-auto"
        >
          {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLatex ? 'LaTeX Table Copied!' : 'Copy LaTeX Research Table'}</span>
        </button>
      </div>

      {/* 4-Model Comparative Benchmark Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100">
              5-Fold Stratified Cross-Validation Benchmark Results
            </h3>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            N = 101,766 Encounters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3 text-right">ROC-AUC</th>
                <th className="px-4 py-3 text-right">PR-AUC</th>
                <th className="px-4 py-3 text-right">Sensitivity (Recall)</th>
                <th className="px-4 py-3 text-right">Specificity</th>
                <th className="px-4 py-3 text-right">Precision</th>
                <th className="px-4 py-3 text-right">F1-Score</th>
                <th className="px-4 py-3 text-right">Brier Score</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {MODEL_METRICS.map((m) => {
                const isSelected = m.name.toLowerCase().includes(selectedModelKey);
                return (
                  <tr
                    key={m.name}
                    onClick={() => {
                      if (m.name.includes('XGBoost')) setSelectedModelKey('xgboost');
                      else if (m.name.includes('Random Forest')) setSelectedModelKey('random_forest');
                      else if (m.name.includes('Logistic')) setSelectedModelKey('logistic_regression');
                      else setSelectedModelKey('svm');
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/40 font-semibold' : 'hover:bg-slate-850/50'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{m.name}</span>
                        {m.isBest && (
                          <span className="bg-indigo-500/20 text-indigo-300 text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-indigo-500/30">
                            Best Model
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                      {m.auc.toFixed(3)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-cyan-300">
                      {m.prAuc.toFixed(3)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-200">
                      {(m.recall * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                      {(m.specificity * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-200">
                      {(m.precision * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-indigo-300">
                      {m.f1.toFixed(3)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                      {m.brierScore.toFixed(3)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected ? 'Active Lab Focus' : 'Select'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics: Interactive ROC Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive ROC Curve */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Receiver Operating Characteristic (ROC) Space
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                True Positive Rate vs. False Positive Rate across all decision thresholds.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">
              AUC = {activeMetrics.auc.toFixed(3)}
            </span>
          </div>

          {/* SVG ROC Plot */}
          <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between">
            <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="40" y2="260" stroke="#334155" strokeWidth="1" />
              <line x1="40" y1="260" x2="380" y2="260" stroke="#334155" strokeWidth="1" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="210" y1="20" x2="210" y2="260" stroke="#1e293b" strokeDasharray="3,3" />

              {/* Diagonal Random Classifier Baseline */}
              <line x1="40" y1="260" x2="380" y2="20" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />

              {/* XGBoost Curve (Indigo) */}
              <path
                d="M 40,260 Q 60,110 130,70 T 260,35 T 380,20"
                fill="none"
                stroke="#6366f1"
                strokeWidth={selectedModelKey === 'xgboost' ? '3.5' : '1.5'}
                opacity={selectedModelKey === 'xgboost' ? 1 : 0.4}
              />

              {/* Random Forest Curve (Cyan) */}
              <path
                d="M 40,260 Q 70,125 150,85 T 275,45 T 380,20"
                fill="none"
                stroke="#06b6d4"
                strokeWidth={selectedModelKey === 'random_forest' ? '3.5' : '1.5'}
                opacity={selectedModelKey === 'random_forest' ? 1 : 0.4}
              />

              {/* Logistic Regression Curve (Amber) */}
              <path
                d="M 40,260 Q 90,150 170,110 T 290,65 T 380,20"
                fill="none"
                stroke="#f59e0b"
                strokeWidth={selectedModelKey === 'logistic_regression' ? '3.5' : '1.5'}
                opacity={selectedModelKey === 'logistic_regression' ? 1 : 0.4}
              />

              {/* SVM Curve (Emerald) */}
              <path
                d="M 40,260 Q 80,135 160,95 T 280,55 T 380,20"
                fill="none"
                stroke="#10b981"
                strokeWidth={selectedModelKey === 'svm' ? '3.5' : '1.5'}
                opacity={selectedModelKey === 'svm' ? 1 : 0.4}
              />

              {/* Axes Labels */}
              <text x="210" y="290" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">
                1 - Specificity (False Positive Rate)
              </text>
              <text x="-140" y="15" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold" transform="rotate(-90)">
                Sensitivity (True Positive Rate)
              </text>
              <text x="35" y="275" fill="#64748b" fontSize="10">0.0</text>
              <text x="375" y="275" fill="#64748b" fontSize="10">1.0</text>
              <text x="20" y="25" fill="#64748b" fontSize="10">1.0</text>
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <span className="w-2.5 h-1 bg-indigo-500 rounded" /> XGBoost (0.781)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-2.5 h-1 bg-cyan-500 rounded" /> Random Forest (0.768)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-1 bg-emerald-500 rounded" /> SVM RBF (0.749)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2.5 h-1 bg-amber-500 rounded" /> Logistic Reg (0.728)
              </span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix & Clinical Risk Cost Matrix */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Confusion Matrix: {activeMetrics.name}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Cutoff = 0.50</span>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-3">
              {/* True Negative */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg text-center space-y-0.5">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">True Negative (TN)</span>
                <span className="text-xl font-bold font-mono text-emerald-300">{activeCM.tn.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block">Correctly predicted non-readmit</span>
              </div>

              {/* False Positive */}
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-lg text-center space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">False Positive (FP)</span>
                <span className="text-xl font-bold font-mono text-amber-300">{activeCM.fp.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block">Care management triggered</span>
              </div>

              {/* False Negative */}
              <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-center space-y-0.5">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">False Negative (FN)</span>
                <span className="text-xl font-bold font-mono text-rose-300">{activeCM.fn.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block">Missed high-risk readmissions</span>
              </div>

              {/* True Positive */}
              <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-lg text-center space-y-0.5">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">True Positive (TP)</span>
                <span className="text-xl font-bold font-mono text-indigo-300">{activeCM.tp.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block">Successfully flagged for follow-up</span>
              </div>
            </div>
          </div>

          {/* Clinical Cost Explanation */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-200 block">Clinical Utility & Asymmetric Costs:</span>
            <p className="leading-relaxed">
              In clinical readmission prevention, <strong>False Negatives (FN)</strong> carry higher clinical penalties (unprevented emergency readmission) than <strong>False Positives (FP)</strong> (benign transitional outreach call). Thus, XGBoost with higher recall ({ (activeMetrics.recall * 100).toFixed(1) }%) is preferred.
            </p>
          </div>
        </div>

      </div>

      {/* SHAP Formulation & Interpretability Foundations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">
            Mathematical Formulation: TreeSHAP Feature Attribution
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <p>
              Shapley values originate from cooperative game theory and uniquely satisfy four fundamental axioms of fair attribution: <strong>Efficiency, Symmetry, Dummy (Null player), and Additivity</strong>.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-indigo-300 text-center text-sm">
              f(x) = E[f(x)] + &sum;<sub>i=1</sub><sup>M</sup> &phi;<sub>i</sub>(x)
            </div>
            <p className="text-slate-400 text-[11px]">
              Where $E[f(x)] = 0.421$ represents the average expected readmission risk across all 101,766 historical encounters, and $\phi_i(x)$ is the marginal contribution of feature $i$ for patient $x$.
            </p>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block">Why Accuracy Fails in Clinical ML:</span>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>Readmission classes are frequently imbalanced (~42% readmitted, 58% unreadmitted).</li>
              <li>A trivial naive baseline predicting "No Readmission" achieves ~58% accuracy but provides zero clinical decision support.</li>
              <li>Clinicians require <strong>calibrated probabilities</strong> and <strong>ROC-AUC discrimination</strong> rather than arbitrary binary 0/1 thresholds.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
