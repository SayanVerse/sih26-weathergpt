import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TemperatureUnit, WindSpeedUnit, PressureUnit } from '../types/settings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemperature(celsius: number, unit: TemperatureUnit = 'celsius'): string {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  if (unit === 'fahrenheit') {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTemperatureNumber(celsius: number, unit: TemperatureUnit = 'celsius'): number {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return 0;
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit = 'kmh'): string {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
  switch (unit) {
    case 'mph':
      return `${Math.round(kmh * 0.621371)} mph`;
    case 'ms':
      return `${(kmh / 3.6).toFixed(1)} m/s`;
    case 'knots':
      return `${Math.round(kmh * 0.539957)} kn`;
    case 'kmh':
    default:
      return `${Math.round(kmh)} km/h`;
  }
}

export function formatPressure(hpa: number, unit: PressureUnit = 'hpa'): string {
  if (hpa === undefined || hpa === null || isNaN(hpa)) return '--';
  switch (unit) {
    case 'inhg':
      return `${(hpa * 0.02953).toFixed(2)} inHg`;
    case 'mmhg':
      return `${Math.round(hpa * 0.750062)} mmHg`;
    case 'hpa':
    default:
      return `${Math.round(hpa)} hPa`;
  }
}

export function getUVDescription(uv: number): { label: string; color: string; bg: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
  if (uv <= 10) return { label: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  return { label: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
}

export function getAirQualityDescription(aqi: number): { label: string; color: string; text: string } {
  if (aqi <= 50) return { label: 'Good', color: 'text-emerald-400', text: 'Air quality is satisfactory and poses little to no risk.' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-amber-400', text: 'Air quality is acceptable for most people.' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: 'text-orange-400', text: 'Members of sensitive groups may experience health effects.' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-rose-400', text: 'Everyone may begin to experience health effects.' };
  return { label: 'Hazardous', color: 'text-purple-400', text: 'Health warning of emergency conditions.' };
}
