import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Activity,
  Gauge,
  Thermometer,
  Wind,
  Moon,
  Sun,
  Laptop,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Code2,
  Users,
  Languages,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { TemperatureUnit, WindSpeedUnit, PressureUnit, ThemeMode, DataSourceMode, PersonaMode, LanguageMode } from '../types/settings';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    backendHealth,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPressureUnit,
    setTheme,
    setDataSourceMode,
    setPersona,
    setLanguage,
    setApiBaseUrl,
    checkBackendHealth,
    resetSettings,
  } = useSettings();

  const [apiUrlInput, setApiUrlInput] = useState(settings.apiBaseUrl);

  useEffect(() => {
    setApiUrlInput(settings.apiBaseUrl);
  }, [settings.apiBaseUrl]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Settings
          </h1>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Configure measurement units, backend data source, and display preferences.
        </p>
      </div>

      {/* Backend & Data Source Connection Card */}
      <Card className="p-6 space-y-4 bg-white/70 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Data Source & Backend Telemetry</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose between live FastAPI backend or instant local simulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                backendHealth.status === 'connected'
                  ? 'emerald'
                  : backendHealth.status === 'checking'
                  ? 'blue'
                  : 'amber'
              }
              size="sm"
            >
              {backendHealth.status === 'connected'
                ? `FastAPI Online (${backendHealth.latencyMs}ms)`
                : backendHealth.status === 'checking'
                ? 'Pinging...'
                : 'FastAPI Offline'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={checkBackendHealth}
              className="text-[11px] h-7 px-2.5"
            >
              Test Ping
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              id: 'auto' as DataSourceMode,
              label: 'Auto (Recommended)',
              desc: 'Tries FastAPI, gracefully falls back to mock if offline',
            },
            {
              id: 'fastapi' as DataSourceMode,
              label: 'FastAPI Backend',
              desc: 'Strictly connects to http://localhost:8000',
            },
            {
              id: 'mock' as DataSourceMode,
              label: 'Mock Simulation',
              desc: 'Instant synthetic data, zero network timeout delay',
            },
          ].map((mode) => {
            const isSelected = settings.dataSourceMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setDataSourceMode(mode.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs'
                    : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950/60 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400'
                }`}
              >
                <div className="text-xs font-semibold mb-0.5">{mode.label}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Backend API Base URL Input */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-500" />
              FastAPI Endpoint URL (e.g. Render, Railway, or Localhost)
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Active: {settings.apiBaseUrl}
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrlInput}
              onChange={(e) => setApiUrlInput(e.target.value)}
              placeholder="https://your-backend.onrender.com or http://localhost:8000"
              className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setApiBaseUrl(apiUrlInput);
                checkBackendHealth();
              }}
              className="text-xs h-9 px-3.5 shrink-0"
            >
              Save URL
            </Button>
          </div>
        </div>
      </Card>

      {/* 1. Units & Measurement Preferences */}
      <Card className="p-6 space-y-5 bg-white/70 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Measurement Units</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize temperature, wind velocity, and barometric scales
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Temperature Unit */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              Temperature
            </label>
            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setTemperatureUnit('celsius')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.temperatureUnit === 'celsius'
                    ? 'bg-white dark:bg-blue-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => setTemperatureUnit('fahrenheit')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  settings.temperatureUnit === 'fahrenheit'
                    ? 'bg-white dark:bg-blue-600 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Wind Speed Unit */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              Wind Speed
            </label>
            <select
              value={settings.windSpeedUnit}
              onChange={(e) => setWindSpeedUnit(e.target.value as WindSpeedUnit)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm dark:shadow-none"
            >
              <option value="kmh">Kilometers / Hour (km/h)</option>
              <option value="mph">Miles / Hour (mph)</option>
              <option value="ms">Meters / Second (m/s)</option>
              <option value="knots">Knots (kn)</option>
            </select>
          </div>

          {/* Pressure Unit */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              Barometer
            </label>
            <select
              value={settings.pressureUnit}
              onChange={(e) => setPressureUnit(e.target.value as PressureUnit)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm dark:shadow-none"
            >
              <option value="hpa">Hectopascals (hPa)</option>
              <option value="inhg">Inches of Mercury (inHg)</option>
              <option value="mmhg">Millimeters of Mercury (mmHg)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 2. Appearance & Theme */}
      <Card className="p-6 space-y-4 bg-white/70 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Interface & Atmosphere</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Theme palette and dynamic meteorological particle effects
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { id: 'dark' as ThemeMode, label: 'Dark Mode (Default)', icon: Moon },
            { id: 'light' as ThemeMode, label: 'Light Mode', icon: Sun },
            { id: 'system' as ThemeMode, label: 'System Sync', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = settings.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'bg-white hover:bg-zinc-50 dark:bg-zinc-950/60 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. AI Preferences */}
      <Card className="p-6 space-y-4 bg-white/70 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Intelligence</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personalize the Assistant's persona and language
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Persona */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Assistant Persona
            </label>
            <select
              value={settings.persona}
              onChange={(e) => setPersona(e.target.value as PersonaMode)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm dark:shadow-none"
            >
              <option value="general">General User (Standard Advice)</option>
              <option value="farmer">Farmer (Agriculture & Irrigation Advice)</option>
              <option value="traveller">Traveller (Commute & Safety Advice)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-emerald-500 dark:text-green-400" />
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value as LanguageMode)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm dark:shadow-none"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="bengali">Bengali</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Reset & Diagnostic Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={resetSettings}
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border-zinc-300 dark:border-zinc-800 hover:border-rose-500/30"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset to Factory Defaults
        </Button>

        <span className="text-xs text-zinc-500 font-mono">
          WeatherGPT v1.0.0-prod
        </span>
      </div>
    </div>
  );
};
