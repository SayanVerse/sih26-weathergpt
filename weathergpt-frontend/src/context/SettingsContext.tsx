import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppSettings,
  TemperatureUnit,
  WindSpeedUnit,
  PressureUnit,
  ThemeMode,
  DataSourceMode,
  PersonaMode,
  LanguageMode,
  BackendHealthStatus,
} from '../types/settings';
import { getApiBaseUrl, setApiBaseUrl as saveApiBaseUrl, getDataSourceMode, setDataSourceMode as saveDataSourceMode } from '../api/client';
import { systemApi } from '../api/system';

interface SettingsContextType {
  settings: AppSettings;
  backendHealth: BackendHealthStatus;
  updateSettings: (partial: Partial<AppSettings>) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
  setPressureUnit: (unit: PressureUnit) => void;
  setTheme: (theme: ThemeMode) => void;
  setDataSourceMode: (mode: DataSourceMode) => void;
  setPersona: (persona: PersonaMode) => void;
  setLanguage: (language: LanguageMode) => void;
  setApiBaseUrl: (url: string) => void;
  checkBackendHealth: () => Promise<void>;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiBaseUrl: getApiBaseUrl(),
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hpa',
  theme: 'dark',
  dataSourceMode: getDataSourceMode(),
  persona: 'general',
  language: 'english',
  autoRefreshInterval: 300,
  enableAnimations: true,
  enableAtmosphereEffects: true,
  saveHistory: true,
};

const SETTINGS_STORAGE_KEY = 'weathergpt_app_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          apiBaseUrl: getApiBaseUrl(),
          dataSourceMode: getDataSourceMode(),
        };
      }
    } catch (e) {
      console.error('Error loading settings from storage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus>({
    status: 'checking',
    url: getApiBaseUrl(),
  });

  const checkHealth = async () => {
    setBackendHealth((prev) => ({ ...prev, status: 'checking' }));
    const result = await systemApi.checkBackendHealth();
    setBackendHealth(result);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [settings.apiBaseUrl]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to storage', e);
    }
  }, [settings]);

  // Apply dark mode to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.apiBaseUrl !== undefined) {
        saveApiBaseUrl(partial.apiBaseUrl);
      }
      if (partial.dataSourceMode !== undefined) {
        saveDataSourceMode(partial.dataSourceMode);
      }
      return updated;
    });
  };

  const setTemperatureUnit = (temperatureUnit: TemperatureUnit) => updateSettings({ temperatureUnit });
  const setWindSpeedUnit = (windSpeedUnit: WindSpeedUnit) => updateSettings({ windSpeedUnit });
  const setPressureUnit = (pressureUnit: PressureUnit) => updateSettings({ pressureUnit });
  const setTheme = (theme: ThemeMode) => updateSettings({ theme });
  const setPersona = (persona: PersonaMode) => updateSettings({ persona });
  const setLanguage = (language: LanguageMode) => updateSettings({ language });
  const setDataSource = (dataSourceMode: DataSourceMode) => {
    saveDataSourceMode(dataSourceMode);
    updateSettings({ dataSourceMode });
  };
  const setBaseUrl = (apiBaseUrl: string) => {
    saveApiBaseUrl(apiBaseUrl);
    updateSettings({ apiBaseUrl });
    checkHealth();
  };

  const resetSettings = () => {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem('weathergpt_api_base_url');
    localStorage.removeItem('weathergpt_data_source');
    setSettings(DEFAULT_SETTINGS);
    checkHealth();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        backendHealth,
        updateSettings,
        setTemperatureUnit,
        setWindSpeedUnit,
        setPressureUnit,
        setTheme,
        setDataSourceMode: setDataSource,
        setPersona,
        setLanguage,
        setApiBaseUrl: setBaseUrl,
        checkBackendHealth: checkHealth,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
