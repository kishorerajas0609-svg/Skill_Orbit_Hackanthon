import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 focus:ring-emerald-500 border border-emerald-500/30',
    secondary: 'bg-surface-elevated hover:bg-border text-foreground focus:ring-emerald-500 border border-border',
    outline: 'border border-border hover:border-emerald-500/50 hover:bg-emerald-500/10 text-foreground focus:ring-emerald-500',
    ghost: 'hover:bg-surface-elevated text-foreground-muted hover:text-foreground focus:ring-emerald-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 focus:ring-rose-500 border border-rose-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      {children}
    </button>
  );
};
