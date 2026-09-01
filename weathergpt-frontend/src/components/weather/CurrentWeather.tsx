import React from 'react';
import { MapPin, Calendar, Clock, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { CurrentWeatherResponse, DailyForecastResponse } from '../../types/weather';
import { useSettings } from '../../context/SettingsContext';
import { formatTemperature, formatTemperatureNumber } from '../../lib/utils';
import { formatFullDate } from '../../lib/formatters';
import { WeatherIcon } from '../ui/WeatherIcon';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { useWeather } from '../../context/WeatherContext';

interface CurrentWeatherProps {
  current?: CurrentWeatherResponse;
  daily?: DailyForecastResponse;
  isLoading?: boolean;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  current,
  daily,
  isLoading = false,
}) => {
  const { settings } = useSettings();
  const { currentLocation, refreshAll } = useWeather();

  if (isLoading || !current) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <Skeleton className="h-8 w-56 rounded-lg bg-zinc-800" />
            <Skeleton className="h-16 w-40 rounded-xl bg-zinc-800" />
            <Skeleton className="h-5 w-64 rounded-lg bg-zinc-800" />
          </div>
          <Skeleton className="h-28 w-28 rounded-full bg-zinc-800 self-start md:self-auto" />
        </div>
      </div>
    );
  }

  const todayForecast = daily?.forecast[0];
  const formattedTemp = formatTemperature(current.temperature, settings.temperatureUnit);
  const formattedFeelsLike = formatTemperature(current.feels_like, settings.temperatureUnit);
  const formattedHigh = todayForecast
    ? formatTemperature(todayForecast.temperature_high, settings.temperatureUnit)
    : '--';
  const formattedLow = todayForecast
    ? formatTemperature(todayForecast.temperature_low, settings.temperatureUnit)
    : '--';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left: Eyebrow, Location, Condition & Big Temp */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live Weather Conditions
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              {currentLocation.name}
            </h1>
            <span className="text-zinc-400 text-sm">
              {[currentLocation.region, currentLocation.country].filter(Boolean).join(', ')}
            </span>
          </div>

          <div className="text-zinc-400 text-xs sm:text-sm flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatFullDate()}</span>
            <button onClick={refreshAll} className="ml-4 px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-xs font-semibold">
              Reload Weather
            </button>
          </div>

          <div className="pt-2 flex items-baseline gap-4">
            <div className="text-6xl sm:text-7xl font-bold tracking-tighter text-zinc-100 font-mono-numbers">
              {formattedTemp}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xl sm:text-2xl font-semibold text-zinc-200">
                {current.condition}
              </span>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
                <span>
                  Feels like <strong className="text-zinc-200 font-mono-numbers">{formattedFeelsLike}</strong>
                </span>
                {todayForecast && (
                  <div className="flex items-center gap-2 font-mono-numbers text-zinc-300">
                    <span className="flex items-center text-rose-400 gap-0.5">
                      <ArrowUp className="w-3 h-3" />
                      {formattedHigh}
                    </span>
                    <span className="flex items-center text-blue-400 gap-0.5">
                      <ArrowDown className="w-3 h-3" />
                      {formattedLow}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {current.description && (
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed pt-1">
              {current.description}
            </p>
          )}
        </div>

        {/* Right: Weather Visual Graphic */}
        <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 shrink-0 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 md:p-6 backdrop-blur-md">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <WeatherIcon
              name={current.condition || current.icon}
              className="w-16 h-16 sm:w-20 sm:h-20 relative z-10 drop-shadow-md"
              isDay={current.is_day}
            />
          </div>

          <div className="text-center">
            <Badge variant="blue" size="sm" className="font-semibold">
              <Sparkles className="w-3 h-3 text-blue-400" />
              FastAPI Telemetry
            </Badge>
          </div>
        </div>
      </div>

      {/* Sub-metrics bottom bar */}
      <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-zinc-800/60 pt-4 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Wind:</span>
          <span className="text-zinc-200 font-mono-numbers font-medium">{current.wind_speed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Humidity:</span>
          <span className="text-zinc-200 font-mono-numbers font-medium">{current.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">UV Index:</span>
          <span className="text-zinc-200 font-mono-numbers font-medium">{current.uv_index}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Air Quality:</span>
          <span className="text-green-500 font-mono-numbers font-medium">{current.air_quality_index || 42} AQI (Good)</span>
        </div>
      </div>
    </div>
  );
};
