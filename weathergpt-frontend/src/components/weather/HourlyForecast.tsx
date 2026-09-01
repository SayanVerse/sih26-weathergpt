import React, { useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { HourlyForecastResponse } from '../../types/weather';
import { useSettings } from '../../context/SettingsContext';
import { formatTemperature } from '../../lib/utils';
import { formatHour } from '../../lib/formatters';
import { WeatherIcon } from '../ui/WeatherIcon';
import { Skeleton } from '../ui/Skeleton';

interface HourlyForecastProps {
  hourly?: HourlyForecastResponse;
  isLoading?: boolean;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, isLoading = false }) => {
  const { settings } = useSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading || !hourly) {
    return (
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32 rounded-lg bg-zinc-800" />
          <Skeleton className="h-5 w-16 rounded-lg bg-zinc-800" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-20 shrink-0 rounded-2xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            24-Hour Forecast
          </h3>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
            title="Scroll left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
            title="Scroll right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent scroll-smooth"
      >
        {hourly.hourly.slice(0, 24).map((item, index) => {
          const formattedTemp = formatTemperature(item.temperature, settings.temperatureUnit);
          const isNow = index === 0;

          return (
            <div
              key={`${item.time}-${index}`}
              className={`flex flex-col items-center justify-between p-3 rounded-xl shrink-0 min-w-[76px] transition-all duration-150 ${
                isNow
                  ? 'bg-blue-600/15 border border-blue-500/40 text-blue-300'
                  : 'bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200'
              }`}
            >
              <span className="text-xs font-medium text-zinc-400">
                {isNow ? 'Now' : formatHour(item.time)}
              </span>

              <div className="my-2.5">
                <WeatherIcon
                  name={item.condition || item.icon}
                  className="w-6 h-6"
                  isDay={item.is_day}
                />
              </div>

              <span className="text-sm font-bold text-zinc-100 font-mono-numbers">
                {formattedTemp}
              </span>

              {/* Rain Probability Pill */}
              <div className="mt-1.5 flex items-center gap-0.5 text-[10px] font-mono-numbers font-medium text-blue-400">
                <Droplets className="w-2.5 h-2.5" />
                <span>{item.precipitation_probability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
