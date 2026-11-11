import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated text-emerald-400 border border-border shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-foreground-muted">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="mt-5">
          {actionText}
        </Button>
      )}
    </div>
  );
};
