import React, { useState } from 'react';
import { ShapContribution } from '../types';
import { ArrowUpRight, ArrowDownRight, Info, HelpCircle, BarChart3, Layers } from 'lucide-react';

interface ShapWaterfallChartProps {
  contributions: ShapContribution[];
  baseValue?: number;
  finalRiskScore: number;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({
  contributions,
  baseValue = 0.421,
  finalRiskScore,
}) => {
  const [viewMode, setViewMode] = useState<'waterfall' | 'importance'>('waterfall');
  const [selectedFeature, setSelectedFeature] = useState<ShapContribution | null>(null);

  const maxAbsShap = Math.max(...contributions.map((c) => Math.abs(c.shapValue)), 0.6);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">
              Explainable AI: Local SHAP Feature Attribution
            </h3>
            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-cyan-500/30">
              TreeSHAP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact additive decomposition of patient characteristics shifting risk from baseline ({ (baseValue * 100).toFixed(1) }%) to { finalRiskScore.toFixed(1) }%.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('waterfall')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded font-medium transition-all ${
              viewMode === 'waterfall'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Directional SHAP
          </button>
          <button
            onClick={() => setViewMode('importance')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded font-medium transition-all ${
              viewMode === 'importance'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Relative Impact %
          </button>
        </div>
      </div>

      {/* Baseline to Final Risk Summary Banner */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-slate-400">Dataset Baseline $E[f(x)]$:</span>
          <span className="font-mono font-semibold text-slate-200">{(baseValue * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-slate-400">Net SHAP $\sum \phi_i$:</span>
          <span className={`font-mono font-semibold ${finalRiskScore > baseValue * 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {finalRiskScore > baseValue * 100 ? '+' : ''}{(finalRiskScore - baseValue * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-slate-400">Calculated Model Output:</span>
          <span className="font-mono font-bold text-indigo-300">{finalRiskScore.toFixed(1)}%</span>
        </div>
      </div>

      {/* Bars Visualizer */}
      <div className="space-y-3 pt-2">
        {contributions.map((c, idx) => {
          const isPositive = c.shapValue > 0;
          const barWidthPercent = Math.min(100, (Math.abs(c.shapValue) / maxAbsShap) * 100);

          return (
            <div
              key={c.feature + idx}
              onClick={() => setSelectedFeature(selectedFeature?.feature === c.feature ? null : c)}
              className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                selectedFeature?.feature === c.feature
                  ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-slate-200">
                    {c.featureName}
                  </span>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    {String(c.featureValue)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  {viewMode === 'waterfall' ? (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isPositive ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{c.shapValue.toFixed(3)}
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {c.shapValue.toFixed(3)}
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-indigo-300 font-semibold">
                      {c.impactPercentage}% Impact
                    </span>
                  )}
                </div>
              </div>

              {/* Bar visualization */}
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex relative">
                {viewMode === 'waterfall' ? (
                  /* Centered 0 split or directional */
                  <div className="w-full h-full flex">
                    <div className="w-1/2 flex justify-end">
                      {!isPositive && (
                        <div
                          className="h-full bg-emerald-500 rounded-l-full transition-all duration-700"
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      )}
                    </div>
                    <div className="w-px bg-slate-600 h-full shrink-0 z-10" />
                    <div className="w-1/2 flex justify-start">
                      {isPositive && (
                        <div
                          className="h-full bg-rose-500 rounded-r-full transition-all duration-700"
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${c.impactPercentage * 2.5}%` }}
                  />
                )}
              </div>

              {/* Collapsible / Clicked Clinical Rationale */}
              {selectedFeature?.feature === c.feature ? (
                <div className="mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-md">
                  <div className="flex items-start gap-1.5 text-slate-200">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Clinical Explanation:</strong> {c.explanation}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-5">
                    <strong>Model Context:</strong> {c.clinicalContext}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 group-hover:text-slate-300">
                  {c.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend & Guide */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            Positive Value (Increases Readmission Probability)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            Negative Value (Protective / Lowers Readmission Risk)
          </span>
        </div>
        <span className="text-slate-500 italic">
          Click any feature card to view detailed clinical reasoning
        </span>
      </div>
    </div>
  );
};
