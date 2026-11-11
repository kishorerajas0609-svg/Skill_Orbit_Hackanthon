import React from 'react';
import { Sparkles } from 'lucide-react';

interface MatchMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const MatchMeter: React.FC<MatchMeterProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));

  const getColorClass = (val: number) => {
    if (val >= 80) return 'text-emerald-400 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 60) return 'text-cyan-400 stroke-cyan-500 bg-cyan-500/10 border-cyan-500/30';
    if (val >= 40) return 'text-amber-400 stroke-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 stroke-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (val >= 60) return 'bg-gradient-to-r from-cyan-500 to-blue-400';
    if (val >= 40) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    return 'bg-gradient-to-r from-rose-500 to-orange-400';
  };

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getColorClass(normalized)} ${className}`}>
        <Sparkles className="w-3 h-3" />
        <span>{normalized}% Match</span>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1 text-foreground-muted">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Match Score
          </span>
          <span className={`font-bold ${normalized >= 80 ? 'text-emerald-400' : normalized >= 60 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {normalized}%
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated border border-border">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${getBarColor(normalized)}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};
