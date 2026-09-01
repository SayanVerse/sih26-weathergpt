import React from 'react';
import { AlertTriangle, RefreshCw, ServerCrash, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { useSettings } from '../../context/SettingsContext';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Weather Service Unavailable',
  message = 'Unable to fetch real-time atmospheric data from the FastAPI backend.',
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  const { settings, setDataSourceMode } = useSettings();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-md ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
        <ServerCrash className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button variant="primary" size="md" onClick={onRetry} isLoading={isRetrying}>
            <RefreshCw className="w-4 h-4" />
            Retry Request
          </Button>
        )}

        {settings.dataSourceMode === 'fastapi' && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setDataSourceMode('auto')}
          >
            Switch to Dev Simulation
          </Button>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500 flex items-center gap-1.5 font-mono">
        <span>Target Base URL:</span>
        <code className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
          {settings.apiBaseUrl}
        </code>
      </div>
    </div>
  );
};
