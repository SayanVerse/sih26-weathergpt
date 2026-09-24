import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm dark:shadow-none',
      glass: 'bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/60 backdrop-blur-lg shadow-sm',
      subtle: 'bg-zinc-50/90 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/40',
      elevated: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/40',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl p-5 text-zinc-900 dark:text-zinc-100 transition-all duration-200', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
