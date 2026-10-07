import React, { useState, useEffect } from 'react';
import { HistoryRecord, PredictionResult } from '../types';
import { Search, Filter, Download, ArrowRight, Trash2, Calendar, User, Activity, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

interface HistoryPageProps {
  onSelectPrediction: (prediction: PredictionResult) => void;
  token?: string | null;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectPrediction, token }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/predictions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.warn("Failed to load history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.patientSummary.primary_diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientSummary.age_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = filterRisk === 'ALL' || item.riskCategory === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Age Group', 'Gender', 'Stay Days', 'Primary Diagnosis', 'Prior Inpatient', 'Risk Probability', 'Risk Category', 'Model'];
    const rows = history.map((h) => [
      h.id,
      h.timestamp,
      h.patientSummary.age_group,
      h.patientSummary.gender,
      h.patientSummary.time_in_hospital,
      h.patientSummary.primary_diagnosis,
      h.patientSummary.number_inpatient,
      h.riskProbability,
      h.riskCategory,
      h.modelUsed,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MedRisk_Predictions_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <ClinicalDisclaimer compact />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Prediction History & Audit Log</h1>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {filteredHistory.length} Record{filteredHistory.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged readmission risk estimations with full SHAP local attribution snapshots.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={history.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by diagnosis (e.g. Circulatory), age group, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading audit history records...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Activity className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No matching predictions found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run a clinical encounter risk estimation on the Predict page to generate audit log records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp / ID</th>
                  <th className="px-4 py-3">Patient Summary</th>
                  <th className="px-4 py-3">Primary Diagnosis</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Top SHAP Driver</th>
                  <th className="px-4 py-3 text-right">Risk Score</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-slate-200 text-[11px]">{item.id}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-200">
                        {item.patientSummary.age_group} &bull; {item.patientSummary.gender}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.patientSummary.time_in_hospital}d stay, {item.patientSummary.number_inpatient} prior inp.
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px]">
                        {item.patientSummary.primary_diagnosis}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      {item.modelUsed.split('(')[0]}
                    </td>

                    <td className="px-4 py-3.5 text-rose-300 text-[11px]">
                      {item.topFactor}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="font-bold text-sm text-slate-100">
                        {(item.riskProbability * 100).toFixed(1)}%
                      </div>
                      <span className={`inline-block text-[9px] uppercase font-bold px-2 py-0.2 rounded-full border ${
                        item.riskCategory === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        item.riskCategory === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {item.riskCategory}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => onSelectPrediction(item.fullData)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-md text-[11px] font-semibold transition-all"
                      >
                        <span>View XAI</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
