import React from 'react';
import { Sparkles, Sun, Shirt, Droplets, HeartPulse, Wind, ArrowRight } from 'lucide-react';
import { AIInsightData } from '../../types/weather';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { Link } from 'react-router-dom';

interface AIInsightCardProps {
  insights?: AIInsightData;
  isLoading?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insights, isLoading = false }) => {
  if (isLoading || !insights) {
    return (
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-40 rounded-lg bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-full mb-4 rounded-xl bg-zinc-800" />
        <div className="grid sm:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl bg-zinc-800" />
          <Skeleton className="h-20 rounded-xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'outdoor':
        return Sun;
      case 'attire':
        return Shirt;
      case 'rain':
        return Droplets;
      case 'health':
        return HeartPulse;
      case 'wind':
        return Wind;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
            AI Weather Intelligence
          </h3>
        </div>

        <Link
          to="/assistant"
          className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 group cursor-pointer"
        >
          <span>Ask Assistant</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Summary paragraph */}
      <p className="text-xs sm:text-sm text-zinc-300 mb-4 leading-relaxed bg-zinc-950/60 border border-zinc-800 p-3.5 rounded-xl border-l-2 border-l-blue-500">
        {insights.summary}
      </p>

      {/* Actionable Insight Tiles */}
      <div className="grid sm:grid-cols-2 gap-3">
        {insights.insights.map((item, index) => {
          const Icon = getCategoryIcon(item.category);
          return (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/50 border border-zinc-800 transition-colors flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-zinc-200 truncate">
                    {item.title}
                  </h4>
                  {item.importance === 'high' && (
                    <Badge variant="amber" size="sm">
                      Key
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
