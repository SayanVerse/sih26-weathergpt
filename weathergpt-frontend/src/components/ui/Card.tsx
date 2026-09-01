import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-md',
      glass: 'bg-zinc-900/50 border border-zinc-800/60 backdrop-blur-lg',
      subtle: 'bg-zinc-900/30 border border-zinc-800/40',
      elevated: 'bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/40',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl p-5 text-zinc-100 transition-all duration-200', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
