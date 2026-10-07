import React from 'react';
import { Activity, ShieldCheck, Database, GraduationCap, Github, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Academic Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-100 text-sm">
                MedRisk AI <span className="text-indigo-400">Clinical Informatics</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A complete, production-ready Explainable AI (XAI) clinical decision-support platform designed for academic research, health informatics evaluation, and 30-day hospital readmission risk stratification.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Final Year Project Demonstration
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                UCI Diabetes 130-US Hospitals (101,766 Encounters)
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">System Modules</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('predict')} className="hover:text-indigo-400 transition-colors">
                  Risk Prediction Form
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-400 transition-colors">
                  Anonymous Research Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('research')} className="hover:text-indigo-400 transition-colors">
                  Model Benchmark & ROC Curves
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-indigo-400 transition-colors">
                  Historical Prediction Audit Log
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Standards */}
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Methodology & Ethics</h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-indigo-400 transition-colors">
                  System Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('research')} className="hover:text-indigo-400 transition-colors">
                  TreeSHAP Interpretability
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('api')} className="hover:text-indigo-400 transition-colors">
                  REST API Documentation
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Clinical Disclaimer Box */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-2 bg-slate-900/40 p-4 rounded-xl">
          <p className="leading-relaxed">
            <strong>Mandatory Research Disclaimer:</strong> MedRisk AI is an educational and research decision-support tool. It does not diagnose clinical conditions, prescribe therapeutics, or replace the professional judgment, examination, and treatment planning of licensed medical practitioners. The machine learning outputs reflect historical probabilistic associations within the retrospective UCI 130-US Hospitals study cohort.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} MedRisk AI — Explainable Hospital Readmission Prediction System</span>
          <span className="font-mono text-slate-400">XGBoost &bull; Random Forest &bull; Logistic Reg &bull; SVM &bull; SHAP</span>
        </div>

      </div>
    </footer>
  );
};
