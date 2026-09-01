import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Thermometer,
  CloudRain,
  Wind,
  Cloud,
  ZoomIn,
  ZoomOut,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSettings } from '../../context/SettingsContext';
import { formatTemperature, formatWindSpeed } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export type MapLayerType = 'temp' | 'rain' | 'wind' | 'clouds';

export const WeatherMap: React.FC = () => {
  const { currentLocation, currentWeather, setCurrentLocation, savedLocations } = useWeather();
  const { settings } = useSettings();

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('temp');
  const [zoomLevel, setZoomLevel] = useState(6);
  const [isPlayingRadar, setIsPlayingRadar] = useState(false);
  const [selectedPin, setSelectedPin] = useState<{
    name: string;
    lat: number;
    lon: number;
    temp: number;
    condition: string;
    rainProb: number;
    windSpeed: number;
  } | null>(null);

  // Notable reference cities around the world to display on map canvas
  const mapPoints = [
    {
      name: currentLocation.name,
      country: currentLocation.country,
      lat: currentLocation.latitude,
      lon: currentLocation.longitude,
      temp: currentWeather?.temperature || 21,
      condition: currentWeather?.condition || 'Clear',
      rainProb: 15,
      windSpeed: currentWeather?.wind_speed || 14,
      isCurrent: true,
    },
    {
      name: 'New York',
      country: 'US',
      lat: 40.7128,
      lon: -74.006,
      temp: 24,
      condition: 'Sunny',
      rainProb: 5,
      windSpeed: 12,
    },
    {
      name: 'San Francisco',
      country: 'US',
      lat: 37.7749,
      lon: -122.4194,
      temp: 18,
      condition: 'Partly Cloudy',
      rainProb: 10,
      windSpeed: 18,
    },
    {
      name: 'London',
      country: 'UK',
      lat: 51.5074,
      lon: -0.1278,
      temp: 16,
      condition: 'Light Rain',
      rainProb: 65,
      windSpeed: 20,
    },
    {
      name: 'Tokyo',
      country: 'JP',
      lat: 35.6762,
      lon: 139.6503,
      temp: 26,
      condition: 'Clear',
      rainProb: 0,
      windSpeed: 10,
    },
    {
      name: 'Paris',
      country: 'FR',
      lat: 48.8566,
      lon: 2.3522,
      temp: 19,
      condition: 'Cloudy',
      rainProb: 25,
      windSpeed: 15,
    },
    {
      name: 'Sydney',
      country: 'AU',
      lat: -33.8688,
      lon: 151.2093,
      temp: 22,
      condition: 'Sunny',
      rainProb: 10,
      windSpeed: 16,
    },
  ];

  const getLayerColor = (layer: MapLayerType) => {
    switch (layer) {
      case 'temp':
        return 'from-cyan-900/30 via-amber-900/20 to-rose-900/30';
      case 'rain':
        return 'from-blue-950/40 via-cyan-900/40 to-teal-900/30';
      case 'wind':
        return 'from-teal-950/40 via-emerald-900/30 to-cyan-950/40';
      case 'clouds':
        return 'from-slate-900/60 via-slate-800/40 to-slate-900/60';
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-md backdrop-blur-xl">
        {/* Layer Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveLayer('temp')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'temp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>

          <button
            onClick={() => setActiveLayer('rain')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'rain'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation / Radar</span>
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'wind'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Vectors</span>
          </button>

          <button
            onClick={() => setActiveLayer('clouds')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'clouds'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Satellite</span>
          </button>
        </div>

        {/* Zoom & Centering controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-800 rounded-xl p-0.5 border border-zinc-700">
            <button
              onClick={() => setZoomLevel((z) => Math.min(12, z + 1))}
              className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-700 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-zinc-400">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(2, z - 1))}
              className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-700 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPin({
                name: currentLocation.name,
                lat: currentLocation.latitude,
                lon: currentLocation.longitude,
                temp: currentWeather?.temperature || 21,
                condition: currentWeather?.condition || 'Clear',
                rainProb: 15,
                windSpeed: currentWeather?.wind_speed || 14,
              });
            }}
          >
            <Navigation className="w-3.5 h-3.5 mr-1 text-blue-400" />
            Center Current
          </Button>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative h-[560px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Synthetic Map Background Grid & Continents Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Active Weather Heatmap Gradient Simulation */}
        <div
          className={`absolute inset-0 bg-gradient-to-tr ${getLayerColor(
            activeLayer
          )} transition-all duration-700 opacity-70`}
        />

        {/* Global coordinate grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-15 flex justify-between">
          <div className="w-[1px] h-full bg-blue-400 border-dashed border-blue-400" />
          <div className="w-[1px] h-full bg-blue-400 border-dashed border-blue-400" />
          <div className="w-[1px] h-full bg-blue-400 border-dashed border-blue-400" />
          <div className="w-[1px] h-full bg-blue-400 border-dashed border-blue-400" />
        </div>

        {/* Wind streamline / particle animations when wind layer active */}
        {activeLayer === 'wind' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full animate-pulse"
                style={{
                  width: `${60 + (i % 4) * 40}px`,
                  left: `${(i * 13) % 90}%`,
                  top: `${(i * 17) % 85}%`,
                  transform: `rotate(${20 + (i % 6) * 15}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Rain Radar Sweep Simulation when rain layer active */}
        {activeLayer === 'rain' && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-blue-400/30 bg-blue-500/10 pointer-events-none animate-ping opacity-25" />
        )}

        {/* City Marker Pins on Canvas */}
        <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around">
          {mapPoints.map((pin, i) => {
            const isSelected = selectedPin?.name === pin.name;
            const isFocus = pin.isCurrent;

            return (
              <div
                key={i}
                onClick={() => setSelectedPin(pin)}
                className={`relative group cursor-pointer transition-transform duration-200 hover:scale-110 m-4 ${
                  isSelected ? 'scale-110 z-30' : 'z-20'
                }`}
              >
                {/* Ping ring for current location */}
                {isFocus && (
                  <span className="absolute -inset-2 rounded-full bg-blue-400/20 animate-ping pointer-events-none" />
                )}

                {/* Marker Pill */}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-xl border backdrop-blur-md transition-all ${
                    isFocus
                      ? 'bg-blue-600 text-white font-semibold border-blue-400'
                      : isSelected
                      ? 'bg-zinc-800 text-zinc-100 border-blue-400 ring-2 ring-blue-500/30'
                      : 'bg-zinc-900/90 text-zinc-200 border-zinc-700/80 hover:border-zinc-500'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isFocus ? 'text-white' : 'text-blue-400'}`} />
                  <span className="text-xs font-semibold">{pin.name}</span>
                  <span className="text-xs font-mono-numbers opacity-90">
                    {formatTemperature(pin.temp, settings.temperatureUnit)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected City Inspection Popover Card */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-4 z-40 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {selectedPin.name}
                </h4>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {selectedPin.lat.toFixed(2)}° N, {selectedPin.lon.toFixed(2)}° E
                </div>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-zinc-400 hover:text-zinc-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 text-center">
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Temperature</span>
                <span className="text-sm font-semibold text-zinc-100 font-mono-numbers">
                  {formatTemperature(selectedPin.temp, settings.temperatureUnit)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Rain Chance</span>
                <span className="text-sm font-semibold text-blue-400 font-mono-numbers">
                  {selectedPin.rainProb}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 block">Wind</span>
                <span className="text-sm font-semibold text-teal-400 font-mono-numbers">
                  {formatWindSpeed(selectedPin.windSpeed, settings.windSpeedUnit)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => {
                setCurrentLocation({
                  name: selectedPin.name,
                  country: 'Region',
                  latitude: selectedPin.lat,
                  longitude: selectedPin.lon,
                });
              }}
            >
              Load Full Forecast Dashboard
            </Button>
          </div>
        )}

        {/* Layer Legend in bottom right */}
        <div className="absolute bottom-4 right-4 rounded-xl bg-zinc-900/90 border border-zinc-800 px-3 py-2 text-[11px] text-zinc-300 backdrop-blur-md hidden sm:block">
          <div className="font-semibold text-zinc-400 mb-1 capitalize">
            {activeLayer} Scale Legend
          </div>
          {activeLayer === 'temp' && (
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>-10°C</span>
              <div className="w-24 h-2 rounded bg-gradient-to-r from-blue-600 via-amber-400 to-rose-500" />
              <span>40°C</span>
            </div>
          )}
          {activeLayer === 'rain' && (
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>0 mm</span>
              <div className="w-24 h-2 rounded bg-gradient-to-r from-zinc-700 via-blue-500 to-blue-700" />
              <span>50+ mm</span>
            </div>
          )}
          {activeLayer === 'wind' && (
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>0 km/h</span>
              <div className="w-24 h-2 rounded bg-gradient-to-r from-zinc-700 via-blue-400 to-teal-400" />
              <span>100 km/h</span>
            </div>
          )}
          {activeLayer === 'clouds' && (
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span>Clear</span>
              <div className="w-24 h-2 rounded bg-gradient-to-r from-transparent via-zinc-500 to-zinc-200" />
              <span>100% Cover</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
