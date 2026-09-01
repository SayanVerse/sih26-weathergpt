import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  ShieldAlert,
  Compass,
  Activity,
} from 'lucide-react';
import { CurrentWeatherResponse } from '../../types/weather';
import { useSettings } from '../../context/SettingsContext';
import {
  formatWindSpeed,
  formatPressure,
  getUVDescription,
  getAirQualityDescription,
} from '../../lib/utils';
import { getWindDirectionLabel } from '../../lib/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

interface WeatherMetricsProps {
  current?: CurrentWeatherResponse;
  isLoading?: boolean;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ current, isLoading = false }) => {
  const { settings } = useSettings();

  if (isLoading || !current) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-zinc-900" />
        ))}
      </div>
    );
  }

  const uvInfo = getUVDescription(current.uv_index);
  const aqi = current.air_quality_index || 42;
  const aqiInfo = getAirQualityDescription(aqi);
  const windDir = getWindDirectionLabel(current.wind_direction);

  const metrics = [
    {
      id: 'metric-humidity',
      label: 'Humidity',
      value: `${current.humidity}%`,
      subtext: current.humidity > 70 ? 'High moisture' : current.humidity < 35 ? 'Dry air' : 'Comfortable',
      icon: Droplets,
      iconColor: 'text-blue-400',
    },
    {
      id: 'metric-wind',
      label: 'Wind Speed',
      value: formatWindSpeed(current.wind_speed, settings.windSpeedUnit),
      subtext: `From ${windDir} (${current.wind_direction}°)`,
      icon: Wind,
      iconColor: 'text-blue-400',
    },
    {
      id: 'metric-uv',
      label: 'UV Index',
      value: `${current.uv_index}`,
      badge: uvInfo.label,
      badgeColor: uvInfo.color,
      badgeBg: 'bg-zinc-800 border-zinc-700',
      subtext: 'Midday peak irradiance',
      icon: Sun,
      iconColor: 'text-amber-400',
    },
    {
      id: 'metric-pressure',
      label: 'Barometer',
      value: formatPressure(current.pressure, settings.pressureUnit),
      subtext: current.pressure > 1013 ? 'High pressure (Fair)' : 'Low pressure (Precip)',
      icon: Gauge,
      iconColor: 'text-blue-400',
    },
    {
      id: 'metric-visibility',
      label: 'Visibility',
      value: `${current.visibility.toFixed(1)} km`,
      subtext: current.visibility >= 10 ? 'Clear horizon' : 'Reduced visibility',
      icon: Eye,
      iconColor: 'text-blue-400',
    },
    {
      id: 'metric-aqi',
      label: 'Air Quality',
      value: `${aqi} AQI`,
      badge: 'Good',
      badgeColor: 'text-green-400',
      badgeBg: 'bg-green-500/10 border-green-500/30',
      subtext: 'EPA Particulate Standard',
      icon: Activity,
      iconColor: 'text-green-400',
    },
    {
      id: 'metric-sunrise',
      label: 'Sunrise',
      value: current.sunrise ? new Date(current.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      subtext: 'Dawn initiation',
      icon: Sunrise,
      iconColor: 'text-amber-400',
    },
    {
      id: 'metric-sunset',
      label: 'Sunset',
      value: current.sunset ? new Date(current.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      subtext: 'Dusk completion',
      icon: Sunset,
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card
            key={m.id}
            className="p-4 bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-zinc-400 truncate">
                {m.label}
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 shrink-0">
                <Icon className={`w-3.5 h-3.5 ${m.iconColor}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono-numbers tracking-tight">
                {m.value}
              </span>
              {m.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${m.badgeBg || 'bg-zinc-800 border-zinc-700'} ${m.badgeColor || 'text-zinc-300'}`}
                >
                  {m.badge}
                </span>
              )}
            </div>

            <div className="text-[11px] text-zinc-500 truncate">
              {m.subtext}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
