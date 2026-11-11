import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 ${
        hover ? 'hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5' : ''
      } ${glass ? 'glass-panel' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
