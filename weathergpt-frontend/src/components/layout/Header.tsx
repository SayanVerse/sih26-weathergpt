import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  RefreshCw,
  Sparkles,
  Bookmark,
  Sun,
  Moon,
  Settings,
  Layers,
  Activity,
  Check,
  X,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSettings } from '../../context/SettingsContext';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import { LocationSearchResult } from '../../types/location';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WeatherIcon } from '../ui/WeatherIcon';
import { formatTemperature } from '../../lib/utils';
import WarpText from '../ui/WarpText';


export const Header: React.FC = () => {
  const routerLocation = useLocation();
  const {
    currentLocation,
    setCurrentLocation,
    currentWeather,
    refreshAll,
    detectUserLocation,
    isDetectingLocation,
    savedLocations,
    toggleSaveLocation,
    isLocationSaved,
    isLoadingWeather,
  } = useWeather();

  const { settings, setTheme, backendHealth } = useSettings();
  const { searchTerm, setSearchTerm, results, isLoading: isSearching, clearSearch } = useLocationSearch();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Close search popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    setCurrentLocation(loc);
    setIsSearchOpen(false);
    clearSearch();
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isSaved = isLocationSaved(currentLocation);

  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#09090b]/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-4">
          {/* WarpText Logo */}
            <Link to="/" className="shrink-0" aria-label="WeatherGPT Home">
              <WarpText
                text="WeatherGPT"
                color="#e0eaff"
                fontSize={32}
                fontWeight={900}
                letterSpacing="-0.04em"
                lineHeight={1}
                warpStrength={0.24}
                warpScale={2.6}
                speed={0.6}
                pointerInfluence={0.6}
                pointerStrength={0.5}
                refraction={0.026}
                ripple={true}
                style={{ width: 230, height: 56 }}
              />
            </Link>


            <div className="relative hidden md:block" ref={locationDropdownRef}>
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="max-w-[130px] truncate font-medium">{currentLocation.name}</span>
                {currentWeather && (
                  <span className="text-zinc-400 font-mono-numbers">
                    {formatTemperature(currentWeather.temperature, settings.temperatureUnit)}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 transition-colors">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Quick Switch
                  </div>
                  <div className="space-y-0.5 max-h-56 overflow-y-auto">
                    {savedLocations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setCurrentLocation(loc);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${loc.name === currentLocation.name
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{loc.name}</span>
                        </div>
                        {loc.cached_temp !== undefined && (
                          <span className="text-[11px] text-zinc-400 font-mono-numbers">
                            {formatTemperature(loc.cached_temp, settings.temperatureUnit)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 mt-1.5 pt-1.5">
                    <Link
                      to="/locations"
                      onClick={() => setIsLocationDropdownOpen(false)}
                      className="block text-center text-xs text-blue-400 hover:text-blue-300 py-1 font-medium"
                    >
                      Manage All Locations →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar with Debounced Dropdown */}
          <div className="flex-1 max-w-md relative" ref={searchContainerRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search city, region, or coordinates..."
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-blue-500 rounded-full pl-9 pr-9 py-1.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm dark:shadow-none"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => {
                    clearSearch();
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Popover */}
            {isSearchOpen && searchTerm.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 transition-colors">
                <div className="p-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Search Results</span>
                    {isSearching && (
                      <span className="text-blue-400 text-[10px] animate-pulse">Querying FastAPI...</span>
                    )}
                  </div>

                  {results.length === 0 && !isSearching ? (
                    <div className="px-4 py-6 text-center text-xs text-zinc-400">
                      No matching cities found for &ldquo;{searchTerm}&rdquo;.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {results.map((loc, idx) => (
                        <button
                          key={`${loc.name}-${loc.latitude}-${idx}`}
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 truncate">
                                {loc.name}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                {[loc.region, loc.country].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                            {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Geolocation Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={detectUserLocation}
              isLoading={isDetectingLocation}
              title="Use My Current GPS Location"
              aria-label="Use My Current GPS Location"
              className="text-zinc-600 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500/40"
            >
              <Compass className="w-4 h-4" />
            </Button>

            {/* Favorite Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleSaveLocation(currentLocation)}
              title={isSaved ? 'Remove from Saved Locations' : 'Save this Location'}
              aria-label={isSaved ? 'Remove from Saved Locations' : 'Save this Location'}
              className={isSaved ? 'text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-500/10' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </Button>

            {/* Refresh Data Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              isLoading={isRefreshing || isLoadingWeather}
              title="Refresh Weather Data"
              aria-label="Refresh Weather Data"
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>


          </div>
        </div>
      </div>
    </header>
  );
};
