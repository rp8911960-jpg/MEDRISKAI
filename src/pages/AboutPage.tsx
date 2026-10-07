import React from 'react';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { BookOpen, ShieldCheck, Database, Server, Layers, GraduationCap, Github, FileCode, CheckCircle2, Hospital } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      <ClinicalDisclaimer />

      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Final Year Project Academic Specification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
          About MedRisk AI Decision Support
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          An Explainable Artificial Intelligence (XAI) web platform engineered to bridge complex machine learning classifiers with transparent, interpretable, and clinically grounded 30-day readmission risk insights.
        </p>
      </div>

      {/* Project Motivation: CMS HRRP & Healthcare Need */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-indigo-400">
          <Hospital className="w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-100">Clinical & Economic Problem Context</h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Unplanned 30-day hospital readmissions represent a critical challenge in modern health systems, costing over <strong>$17 billion annually</strong> in the United States alone. Under the <strong>Centers for Medicare & Medicaid Services (CMS) Hospital Readmissions Reduction Program (HRRP)</strong>, hospitals with excessive readmission rates face substantial reimbursement penalties.
          </p>
          <p>
            While black-box machine learning models (such as deep neural networks or gradient boosted trees) achieve high predictive power, clinical adoption has stalled due to the lack of interpretability. Physicians and care managers cannot safely act on recommendations without understanding <em>why</em> a patient is classified as high-risk.
          </p>
          <p>
            <strong>MedRisk AI solves this bottleneck</strong> by computing individual Shapley Additive exPlanations (TreeSHAP) for every patient encounter, transforming opaque prediction vectors into actionable, evidence-based transitional care checklists.
          </p>
        </div>
      </div>

      {/* Architecture & Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <Server className="w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-100">Full-Stack System Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-300 block">Frontend Presentation Layer</span>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>React 19 & TypeScript</li>
              <li>Vite 6 build system</li>
              <li>Tailwind CSS styling</li>
              <li>Interactive SVG Gauges & Charts</li>
              <li>Print-ready PDF report generator</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 block">Backend & ML Engine</span>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>FastAPI (Python) & Express TS</li>
              <li>XGBoost & Scikit-learn</li>
              <li>TreeSHAP marginal attribution</li>
              <li>JWT / Bcrypt authentication</li>
              <li>Scalable REST API endpoints</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-300 block">Dataset & Validation</span>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
              <li>UCI Diabetes 130-US Hospitals</li>
              <li>101,766 clinical encounters</li>
              <li>10 years (1999–2008)</li>
              <li>No PII / PHI identifiers</li>
              <li>5-Fold Stratified Cross-Validation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset & Privacy Statement */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <Database className="w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-100">Dataset Provenance & Privacy Safeguards</h2>
        </div>
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            The underlying machine learning models are trained and validated against the publicly available <strong>Diabetes 130-US Hospitals (1999-2008) Dataset</strong> curated by Strack et al. (UCI Machine Learning Repository).
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
            Citation: Strack, B., DeShazo, J. P., Gennings, C., Olmo, J. L., Ventura, S., Cios, K. J., & Clore, J. N. (2014). Impact of HbA1c measurement on hospital readmission rates: analysis of 70,000 clinical database patient records. BioMed Research International, 2014.
          </div>
          <p className="text-slate-400 text-xs pt-1">
            <strong>Privacy & Ethics Assurance:</strong> This application does not capture, store, or transmit Personally Identifiable Information (PII) or Protected Health Information (PHI) like names, Social Security numbers, phone numbers, or residential addresses. All encounters are evaluated using anonymous categorical and numerical clinical markers.
          </p>
        </div>
      </div>

    </div>
  );
};
