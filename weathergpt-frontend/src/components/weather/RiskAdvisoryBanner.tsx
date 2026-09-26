import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, Activity } from 'lucide-react';
import { RiskAssessmentResponse, WeatherRiskItem } from '../../types/weather';
import { Badge } from '../ui/Badge';

interface RiskAdvisoryBannerProps {
  riskAssessment?: RiskAssessmentResponse;
}

export const RiskAdvisoryBanner: React.FC<RiskAdvisoryBannerProps> = ({ riskAssessment }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!riskAssessment || riskAssessment.risks.length === 0 || riskAssessment.composite_risk_score === 'LOW') {
    return null;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getSeverityColors = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-50/90 dark:bg-red-950/30 border-red-200/90 dark:border-red-500/30 text-red-950 dark:text-red-100';
      case 'WARNING':
        return 'bg-orange-50/90 dark:bg-orange-950/30 border-orange-200/90 dark:border-orange-500/30 text-orange-950 dark:text-orange-100';
      case 'WATCH':
        return 'bg-amber-50/90 dark:bg-amber-950/25 border-amber-200/90 dark:border-amber-500/25 text-amber-950 dark:text-amber-100';
      default:
        return 'bg-zinc-50/90 dark:bg-zinc-800/80 border-zinc-200/90 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100';
    }
  };

  const getIconColors = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-600 dark:text-red-400';
      case 'WARNING':
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
      case 'WATCH':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400';
    }
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'rose';
      case 'WARNING':
      case 'WATCH':
        return 'amber';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {riskAssessment.risks.map((risk, index) => {
        const isExpanded = expandedIndex === index;
        const severityColors = getSeverityColors(risk.severity);
        const iconColors = getIconColors(risk.severity);
        const badgeVariant = getBadgeVariant(risk.severity) as 'rose' | 'amber' | 'neutral';

        return (
          <div
            key={index}
            className={`rounded-xl border p-4 transition-all duration-200 backdrop-blur-md shadow-xs ${severityColors}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${iconColors}`}>
                  {risk.severity === 'CRITICAL' ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      {risk.hazard}
                    </span>
                    <Badge variant={badgeVariant} size="sm">
                      {risk.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium opacity-90">
                    {risk.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleExpand(index)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse advisory' : 'Expand details'}
                aria-label="Toggle details"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3 opacity-70" />
                  <span className="font-semibold opacity-90">Affected Metric:</span>
                  <span className="opacity-80">{risk.affected_metric}</span>
                </div>
                
                {risk.recommended_action && (
                  <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-black/5 dark:border-white/5 shadow-sm mt-2">
                    <strong className="font-semibold block mb-1">
                      Recommended Action:
                    </strong>
                    <p className="opacity-90">{risk.recommended_action}</p>
                  </div>
                )}
                
                <div className="text-[10px] opacity-70 flex items-center justify-between mt-2 pt-1">
                  <span>Risk Level: {risk.risk_level}</span>
                  <span>Time Period: {risk.time_period}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
