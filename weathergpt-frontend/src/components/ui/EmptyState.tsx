import React from 'react';
import { CloudOff } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-4">
        {icon || <CloudOff className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
