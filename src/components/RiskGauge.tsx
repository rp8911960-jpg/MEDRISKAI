import React from 'react';
import { RiskTier } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  tier: RiskTier;
  confidenceInterval?: { lower: number; upper: number };
  lowMax?: number;
  mediumMax?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  tier,
  confidenceInterval,
  lowMax = 30,
  mediumMax = 70,
  size = 'md',
}) => {
  // SVG gauge calculations
  // Semi-circle arc: 180 degrees
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = size === 'lg' ? 90 : size === 'sm' ? 55 : 75;
  const strokeWidth = size === 'lg' ? 14 : size === 'sm' ? 9 : 12;
  const svgWidth = radius * 2 + strokeWidth * 2;
  const svgHeight = radius + strokeWidth * 2 + 10;
  
  // Circumference of half circle = PI * radius
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Colors
  const getColor = () => {
    if (tier === 'HIGH') return { stroke: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (tier === 'MEDIUM') return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const currentTheme = getColor();

  const getTierIcon = () => {
    if (tier === 'HIGH') return <AlertCircle className="w-4 h-4 text-rose-400" />;
    if (tier === 'MEDIUM') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: svgWidth, height: svgHeight }}>
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          {/* Background track arc */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${radius * 2 + strokeWidth},${radius + strokeWidth}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Color-coded segments guide background */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${radius * 2 + strokeWidth},${radius + strokeWidth}`}
            fill="none"
            stroke="#334155"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(lowMax / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Value active arc */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${radius * 2 + strokeWidth},${radius + strokeWidth}`}
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center">
          <span className={`font-bold tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-2xl' : 'text-3xl'} ${currentTheme.text}`}>
            {score.toFixed(1)}%
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
            30-Day Readmission Risk
          </span>
        </div>
      </div>

      {/* Tier Badge & Confidence Interval */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text}`}>
          {getTierIcon()}
          <span>{tier} RISK TIER</span>
        </div>

        {confidenceInterval && (
          <span className="text-[11px] text-slate-400">
            95% CI: [{(confidenceInterval.lower * 100).toFixed(1)}% – {(confidenceInterval.upper * 100).toFixed(1)}%]
          </span>
        )}

        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;{lowMax}% Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> {lowMax}–{mediumMax}% Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;{mediumMax}% High
          </span>
        </div>
      </div>
    </div>
  );
};
