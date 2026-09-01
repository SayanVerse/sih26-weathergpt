import { z } from 'zod';

export type WeatherCondition =
  | 'Clear'
  | 'Sunny'
  | 'Partly Cloudy'
  | 'Cloudy'
  | 'Overcast'
  | 'Mist'
  | 'Fog'
  | 'Light Rain'
  | 'Rain'
  | 'Heavy Rain'
  | 'Thunderstorm'
  | 'Snow'
  | 'Sleet'
  | 'Windy';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  id?: string;
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  is_favorite?: boolean;
}

export interface CurrentWeatherResponse {
  location: LocationInfo;
  temperature: number;
  feels_like: number;
  condition: WeatherCondition | string;
  description: string;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number | string;
  wind_gust?: number;
  visibility: number;
  uv_index: number;
  air_quality_index?: number;
  air_quality_label?: string;
  cloud_cover?: number;
  dew_point?: number;
  sunrise: string;
  sunset: string;
  icon: string;
  timestamp: string;
  is_day: boolean;
}

export interface HourlyForecastItem {
  time: string; // ISO string or format e.g. "14:00"
  timestamp: number;
  temperature: number;
  feels_like: number;
  condition: WeatherCondition | string;
  precipitation_probability: number;
  precipitation_amount?: number; // in mm
  humidity: number;
  wind_speed: number;
  wind_direction?: number | string;
  uv_index?: number;
  icon: string;
  is_day?: boolean;
}

export interface HourlyForecastResponse {
  location: LocationInfo;
  hourly: HourlyForecastItem[];
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  day_name: string; // e.g. "Monday"
  temperature_high: number;
  temperature_low: number;
  condition: WeatherCondition | string;
  description?: string;
  precipitation_probability: number;
  precipitation_amount?: number;
  humidity: number;
  wind_speed: number;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
  icon: string;
}

export interface DailyForecastResponse {
  location: LocationInfo;
  forecast: DailyForecastItem[];
}

export interface WeatherAlertItem {
  id: string;
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  title: string;
  headline: string;
  description: string;
  instruction?: string;
  effective: string;
  expires: string;
  source: string;
  urgency?: 'immediate' | 'expected' | 'future';
  areas: string[];
}

export interface WeatherAlertsResponse {
  location: LocationInfo;
  alerts: WeatherAlertItem[];
}

export interface AIInsightData {
  summary: string;
  insights: {
    category: 'rain' | 'temperature' | 'outdoor' | 'attire' | 'health' | 'wind';
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    iconName?: string;
  }[];
  generated_at: string;
}

// Zod schemas for runtime validation
export const LocationInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  region: z.string().optional(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
});

export const CurrentWeatherSchema = z.object({
  location: LocationInfoSchema,
  temperature: z.number(),
  feels_like: z.number(),
  condition: z.string(),
  description: z.string().default(''),
  humidity: z.number().default(0),
  pressure: z.number().default(1013),
  wind_speed: z.number().default(0),
  wind_direction: z.union([z.number(), z.string()]).default(0),
  visibility: z.number().default(10),
  uv_index: z.number().default(0),
  sunrise: z.string().default('06:00 AM'),
  sunset: z.string().default('06:00 PM'),
  icon: z.string().default('sun'),
  timestamp: z.string().default(() => new Date().toISOString()),
  is_day: z.boolean().default(true),
});
