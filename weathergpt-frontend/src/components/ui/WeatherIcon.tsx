import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Umbrella,
  Compass,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface WeatherIconProps {
  name: string;
  className?: string;
  isDay?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  name,
  className = 'w-6 h-6',
  isDay = true,
}) => {
  const n = (name || '').toLowerCase();

  if (n.includes('thunder') || n.includes('lightning') || n.includes('storm')) {
    return <CloudLightning className={cn('text-amber-400', className)} />;
  }
  if (n.includes('heavy rain') || n.includes('shower')) {
    return <CloudRain className={cn('text-cyan-400', className)} />;
  }
  if (n.includes('rain') || n.includes('drizzle')) {
    return <CloudDrizzle className={cn('text-cyan-300', className)} />;
  }
  if (n.includes('snow') || n.includes('sleet') || n.includes('ice') || n.includes('blizzard')) {
    return <CloudSnow className={cn('text-sky-200', className)} />;
  }
  if (n.includes('fog') || n.includes('mist') || n.includes('haze')) {
    return <CloudFog className={cn('text-slate-400', className)} />;
  }
  if (n.includes('wind')) {
    return <Wind className={cn('text-teal-300', className)} />;
  }
  if (n.includes('partly') || n.includes('scattered')) {
    return isDay ? (
      <CloudSun className={cn('text-amber-300', className)} />
    ) : (
      <CloudMoon className={cn('text-indigo-300', className)} />
    );
  }
  if (n.includes('overcast') || n.includes('cloud')) {
    return <Cloud className={cn('text-slate-300', className)} />;
  }
  if (n.includes('sun') || n.includes('clear')) {
    return isDay ? (
      <Sun className={cn('text-amber-400', className)} />
    ) : (
      <Moon className={cn('text-indigo-200', className)} />
    );
  }

  // Fallback defaults
  return isDay ? (
    <Sun className={cn('text-amber-400', className)} />
  ) : (
    <Moon className={cn('text-indigo-200', className)} />
  );
};
