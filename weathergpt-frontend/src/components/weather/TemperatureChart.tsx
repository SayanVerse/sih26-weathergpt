import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { HourlyForecastResponse } from '../../types/weather';
import { useSettings } from '../../context/SettingsContext';
import { formatTemperatureNumber, formatTemperature } from '../../lib/utils';
import { formatHour } from '../../lib/formatters';
import { Skeleton } from '../ui/Skeleton';

interface TemperatureChartProps {
  hourly?: HourlyForecastResponse;
  isLoading?: boolean;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  hourly,
  isLoading = false,
}) => {
  const { settings } = useSettings();
  const [activeMetric, setActiveMetric] = useState<'temp' | 'feels_like' | 'both'>('both');

  if (isLoading || !hourly) {
    return (
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 backdrop-blur-xl">
        <Skeleton className="h-5 w-44 mb-4 rounded-lg bg-zinc-800" />
        <Skeleton className="h-56 w-full rounded-xl bg-zinc-800" />
      </div>
    );
  }

  const chartData = hourly.hourly.slice(0, 24).map((item) => ({
    time: formatHour(item.time),
    rawTime: item.time,
    temp: formatTemperatureNumber(item.temperature, settings.temperatureUnit),
    feels_like: formatTemperatureNumber(item.feels_like, settings.temperatureUnit),
    condition: item.condition,
    humidity: item.humidity,
  }));

  const unitLabel = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            24-Hour Temperature Curve
          </h3>
        </div>

        {/* Metric Switch */}
        <div className="flex items-center gap-1 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60 text-xs">
          <button
            onClick={() => setActiveMetric('both')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeMetric === 'both'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Actual & Feels Like
          </button>
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeMetric === 'temp'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Actual Only
          </button>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              interval={2}
            />

            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit={unitLabel}
              domain={['auto', 'auto']}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                      <div className="font-bold text-zinc-200">{data.time}</div>
                      <div className="text-blue-400 font-mono font-semibold">
                        Temp: {data.temp}
                        {unitLabel}
                      </div>
                      <div className="text-indigo-400 font-mono">
                        Feels like: {data.feels_like}
                        {unitLabel}
                      </div>
                      <div className="text-zinc-400">Condition: {data.condition}</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {(activeMetric === 'both' || activeMetric === 'temp') && (
              <Area
                type="monotone"
                dataKey="temp"
                name="Temperature"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            )}

            {(activeMetric === 'both' || activeMetric === 'feels_like') && (
              <Area
                type="monotone"
                dataKey="feels_like"
                name="Feels Like"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#feelsGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
