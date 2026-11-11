import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-elevated border border-border/50 ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton className="h-4 w-1/3" />
          <LoadingSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <LoadingSkeleton className="h-3 w-full" />
      <LoadingSkeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-2">
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
        <LoadingSkeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
};
