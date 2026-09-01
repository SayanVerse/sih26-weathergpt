import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-150',
            icon && 'pl-10',
            rightElement && 'pr-10',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 text-zinc-400 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
