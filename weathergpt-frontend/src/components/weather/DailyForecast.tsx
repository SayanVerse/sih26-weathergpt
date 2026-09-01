import React from 'react';
import { CalendarDays, Droplets, ArrowUp, ArrowDown } from 'lucide-react';
import { DailyForecastResponse } from '../../types/weather';
import { useSettings } from '../../context/SettingsContext';
import { formatTemperature } from '../../lib/utils';
import { WeatherIcon } from '../ui/WeatherIcon';
import { Skeleton } from '../ui/Skeleton';

interface DailyForecastProps {
  daily?: DailyForecastResponse;
  isLoading?: boolean;
}

const OverflowMarquee: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, ReactSetIsOverflowing] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        ReactSetIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className="hidden sm:flex flex-1 overflow-hidden relative group w-full">
      {isOverflowing ? (
        <div className="animate-marquee pause-on-hover hover:text-white transition-colors w-max">
          <span className="text-xs text-zinc-300 pr-8">{text}</span>
          <span className="text-xs text-zinc-300 pr-8" aria-hidden="true">{text}</span>
        </div>
      ) : (
        <span ref={textRef} className="text-xs text-zinc-300 truncate inline-block w-full">
          {text}
        </span>
      )}
    </div>
  );
};

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, isLoading = false }) => {
  const { settings } = useSettings();

  if (isLoading || !daily) {
    return (
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 backdrop-blur-xl">
        <Skeleton className="h-5 w-36 mb-4 rounded-lg bg-zinc-800" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate global min/max for the 5-day temperature bar scale
  const temps = daily.forecast.flatMap((d) => [d.temperature_low, d.temperature_high]);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
          5-Day Weather Outlook
        </h3>
      </div>

      <div className="space-y-2">
        {daily.forecast.slice(0, 5).map((day, idx) => {
          const formattedHigh = formatTemperature(day.temperature_high, settings.temperatureUnit);
          const formattedLow = formatTemperature(day.temperature_low, settings.temperatureUnit);
          const isToday = idx === 0;

          // Normalized bar left & width
          const leftPercent = ((day.temperature_low - minTemp) / tempRange) * 100;
          const widthPercent = Math.max(
            15,
            ((day.temperature_high - day.temperature_low) / tempRange) * 100
          );

          return (
            <div
              key={`${day.date}-${idx}`}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-colors ${
                isToday
                  ? 'bg-zinc-800/90 border border-blue-500/30'
                  : 'hover:bg-zinc-850 bg-zinc-900/40 border border-zinc-800/60'
              }`}
            >
              {/* Day Name */}
              <div className="w-20 sm:w-24 shrink-0">
                <span className={`text-xs font-medium ${isToday ? 'text-blue-400 font-semibold' : 'text-zinc-200'}`}>
                  {day.day_name}
                </span>
                {isToday && (
                  <span className="ml-1.5 text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2.5 w-32 sm:w-40 shrink-0 overflow-hidden">
                <WeatherIcon name={day.condition || day.icon} className="w-5 h-5 shrink-0" />
                <OverflowMarquee text={day.condition || ''} />
              </div>

              {/* Precipitation Chance */}
              <div className="w-20 flex items-center gap-1 text-[11px] text-blue-400 font-mono-numbers shrink-0">
                {day.precipitation_probability > 0 ? (
                  <>
                    <Droplets className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-zinc-400 text-[10px] mr-0.5">Rain</span>
                    <span>{Math.round(day.precipitation_probability)}%</span>
                  </>
                ) : (
                  <span className="text-zinc-600 text-xs">—</span>
                )}
              </div>

              {/* Temperature Bar & High/Low */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-[200px] justify-end">
                <span className="text-xs text-zinc-400 font-mono-numbers w-8 text-right">
                  {formattedLow}
                </span>

                {/* Visual thermal spread gradient bar */}
                <div className="hidden md:block flex-1 h-1.5 bg-zinc-800 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 via-amber-400 to-rose-400 opacity-90"
                    style={{
                      left: `${Math.max(0, Math.min(85, leftPercent))}%`,
                      width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-semibold text-zinc-100 font-mono-numbers w-8 text-right">
                  {formattedHigh}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
