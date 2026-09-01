import React from 'react';
import { WeatherMap } from '../components/map/WeatherMap';
import { Map, Layers, Radio, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const MapPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Interactive Weather Radar & Map
            </h1>
            <Badge variant="blue" size="sm">
              Doppler Telemetry
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            Multi-layer meteorological map visualizing temperature gradients, precipitation radar, wind vectors, and cloud systems.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 shrink-0">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Real-time Satellite Feed</span>
        </div>
      </div>

      {/* Main Map Component */}
      <WeatherMap />
    </div>
  );
};
