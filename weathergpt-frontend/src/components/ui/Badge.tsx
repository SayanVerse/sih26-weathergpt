import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate' | 'zinc';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    zinc: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/80',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    cyan: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    slate: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/40',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
