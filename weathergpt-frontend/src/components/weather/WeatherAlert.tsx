import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, X } from 'lucide-react';
import { WeatherAlertsResponse } from '../../types/weather';
import { Badge } from '../ui/Badge';

interface WeatherAlertProps {
  alertsData?: WeatherAlertsResponse;
}

export const WeatherAlert: React.FC<WeatherAlertProps> = ({ alertsData }) => {
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  if (!alertsData || !alertsData.alerts || alertsData.alerts.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  return (
    <div className="space-y-2 mb-4">
      {alertsData.alerts.map((alert) => {
        const isExpanded = expandedAlertId === alert.id;
        const isWarning = alert.severity === 'warning' || alert.severity === 'emergency' || alert.severity === 'high';

        return (
          <div
            key={alert.id}
            className={`rounded-xl border p-4 transition-all duration-200 backdrop-blur-md ${
              isWarning
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-100'
                : 'bg-amber-950/25 border-amber-500/25 text-amber-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isWarning ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {alert.title}
                    </span>
                    <Badge variant={isWarning ? 'rose' : 'amber'} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">
                    {alert.headline}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleExpand(alert.id)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse advisory' : 'Expand details'}
                aria-label="Toggle details"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-xs text-zinc-300 animate-in fade-in duration-150">
                <p className="leading-relaxed">{alert.description}</p>
                {alert.instruction && (
                  <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                    <strong className="text-amber-300 font-semibold block mb-1">
                      Recommended Precautions:
                    </strong>
                    <p className="text-zinc-300">{alert.instruction}</p>
                  </div>
                )}
                <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                  <span>Source: {alert.source}</span>
                  <span>Effective until: {new Date(alert.expires).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
