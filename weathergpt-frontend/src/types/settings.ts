export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type PressureUnit = 'hpa' | 'inhg' | 'mmhg';
export type ThemeMode = 'dark' | 'light' | 'system';
export type DataSourceMode = 'auto' | 'fastapi' | 'mock';
export type PersonaMode = 'general' | 'farmer' | 'traveller';
export type LanguageMode = 'english' | 'hindi' | 'bengali';

export interface AppSettings {
  apiBaseUrl: string;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  theme: ThemeMode;
  dataSourceMode: DataSourceMode;
  persona: PersonaMode;
  language: LanguageMode;
  autoRefreshInterval: number; // in seconds (e.g. 300 = 5min, 0 = disabled)
  enableAnimations: boolean;
  enableAtmosphereEffects: boolean;
  saveHistory: boolean;
}

export interface BackendHealthStatus {
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  latencyMs?: number;
  serverVersion?: string;
  errorMessage?: string;
  lastChecked?: string;
  url: string;
}
