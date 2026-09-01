import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Droplets, Wind } from 'lucide-react';
import { HourlyForecastResponse } from '../../types/weather';
import { useSettings } from '../../context/SettingsContext';
import { formatHour } from '../../lib/formatters';
import { Skeleton } from '../ui/Skeleton';

interface PrecipitationChartProps {
  hourly?: HourlyForecastResponse;
  isLoading?: boolean;
}

export const PrecipitationChart: React.FC<PrecipitationChartProps> = ({
  hourly,
  isLoading = false,
}) => {
  const { settings } = useSettings();

  if (isLoading || !hourly) {
    return (
      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 backdrop-blur-xl">
        <Skeleton className="h-5 w-48 mb-4 rounded-lg bg-zinc-800" />
        <Skeleton className="h-56 w-full rounded-xl bg-zinc-800" />
      </div>
    );
  }

  const chartData = hourly.hourly.slice(0, 24).map((item) => ({
    time: formatHour(item.time),
    rainProb: item.precipitation_probability,
    rainMm: item.precipitation_amount || 0,
    wind: Math.round(item.wind_speed),
    humidity: item.humidity,
  }));

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            Precipitation & Wind Dynamics
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            Rain Chance (%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 rounded-full bg-teal-400" />
            Wind ({settings.windSpeedUnit})
          </span>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              yAxisId="left"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="%"
              domain={[0, 100]}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
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
                        Precip Probability: {data.rainProb}%
                      </div>
                      <div className="text-teal-400 font-mono">
                        Wind: {data.wind} {settings.windSpeedUnit}
                      </div>
                      <div className="text-zinc-400 font-mono">
                        Humidity: {data.humidity}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="rainProb"
              name="Rain Probability"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="wind"
              name="Wind Speed"
              stroke="#2dd4bf"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
