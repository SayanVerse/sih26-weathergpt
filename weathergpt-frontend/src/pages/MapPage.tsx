import React from 'react';
import { WeatherMap } from '../components/map/WeatherMap';
import { Map, Layers, Radio, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const MapPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <Map className="w-12 h-12 text-blue-500" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
        Interactive Weather Radar & Map
      </h1>
      
      <div className="inline-block mt-2 mb-6">
        <Badge variant="blue" size="lg" className="text-sm px-4 py-1">
          Coming Soon
        </Badge>
      </div>
      
      <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        We're working on integrating a powerful, multi-layer meteorological map visualizing temperature gradients, precipitation radar, wind vectors, and cloud systems. Stay tuned for future updates!
      </p>
    </div>
  );
};
