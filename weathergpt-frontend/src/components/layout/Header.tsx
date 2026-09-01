import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  RefreshCw,
  Sparkles,
  Bookmark,
  Sun,
  Moon,
  Settings as SettingsIcon,
  LayoutDashboard,
  BotMessageSquare,
  Map as MapIcon,
  BookmarkCheck,
  ChevronRight,
  Menu,
  X,
  Radio,
  ChevronDown,
  CloudSun,
  Activity,
  Check,
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
  const navigate = useNavigate();
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

  const { settings, setTheme, setTemperatureUnit, backendHealth } = useSettings();
  const { searchTerm, setSearchTerm, results, isLoading: isSearching, clearSearch } = useLocationSearch();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchModalOpen, setIsMobileSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchModalOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [isMobileSearchModalOpen]);

  // Lock body scroll when mobile drawer or mobile search is open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileSearchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isMobileSearchModalOpen]);

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
    setIsMobileSearchModalOpen(false);
    clearSearch();
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isSaved = isLocationSaved(currentLocation);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assistant', label: 'AI WeatherGPT', icon: BotMessageSquare, badge: 'AI' },
    { to: '/map', label: 'Live Weather Map', icon: MapIcon },
    { to: '/locations', label: 'Saved Cities', icon: BookmarkCheck, count: savedLocations.length },
    { to: '/settings', label: 'App Settings', icon: SettingsIcon },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#09090b]/85 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Desktop WarpText Logo */}
              <Link to="/" className="hidden md:block shrink-0" aria-label="WeatherGPT Home">
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
                  style={{ width: 210, height: 50 }}
                />
              </Link>

              {/* Mobile Compact Logo */}
              <Link to="/" className="md:hidden flex items-center gap-2 group" aria-label="WeatherGPT Home">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-blue-700 to-indigo-800 dark:from-zinc-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                    WeatherGPT
                  </span>
                </div>
              </Link>

              {/* Desktop Location Dropdown */}
              <div className="relative hidden lg:block" ref={locationDropdownRef}>
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="max-w-[120px] truncate font-medium">{currentLocation.name}</span>
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
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                            loc.name === currentLocation.name
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
                        className="block text-center text-xs text-blue-500 hover:text-blue-400 py-1 font-medium"
                      >
                        Manage All Locations →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-md relative" ref={searchContainerRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search city, region, or country..."
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

              {/* Desktop Live Search Results Popover */}
              {isSearchOpen && searchTerm.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 transition-colors">
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Search Results</span>
                      {isSearching && (
                        <span className="text-blue-400 text-[10px] animate-pulse">Searching...</span>
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

            {/* Right Action Icons & Mobile Hamburger */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMobileSearchModalOpen(true)}
                title="Search Cities"
                aria-label="Search Cities"
                className="md:hidden text-zinc-600 dark:text-zinc-300 hover:text-blue-500"
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Geolocation Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={detectUserLocation}
                isLoading={isDetectingLocation}
                title="Detect GPS Location"
                aria-label="Detect GPS Location"
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
                className={
                  isSaved
                    ? 'text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-50 dark:bg-amber-500/10'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }
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
                className="hidden sm:inline-flex text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open Navigation Menu"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer ml-1"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE SEARCH OVERLAY MODAL */}
      {/* ========================================================================= */}
      {isMobileSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800 p-4 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search city, state, or country..."
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => clearSearch()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setIsMobileSearchModalOpen(false);
                  clearSearch();
                }}
                className="px-3 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            {/* Quick GPS button */}
            <button
              onClick={() => {
                detectUserLocation();
                setIsMobileSearchModalOpen(false);
              }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/20 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Use My Current GPS Location
            </button>
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950">
            {isSearching && (
              <div className="flex items-center justify-center py-12 gap-2 text-sm text-zinc-400">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Searching locations...</span>
              </div>
            )}

            {!isSearching && searchTerm.trim().length >= 2 && results.length === 0 && (
              <div className="text-center py-12 text-sm text-zinc-400">
                No matching places found for &ldquo;{searchTerm}&rdquo;
              </div>
            )}

            <div className="space-y-2">
              {results.map((loc, idx) => (
                <button
                  key={`${loc.name}-${loc.latitude}-${idx}`}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left hover:border-blue-500/50 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {loc.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {[loc.region, loc.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OUT HAMBURGER MENU DRAWER */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Sidebar */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-[#09090b] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
                  <CloudSun className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  WeatherGPT
                </span>
                <Badge variant="blue" size="sm">
                  v2.0
                </Badge>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Location Card */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Active Location
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {currentLocation.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-5.5">
                    {[currentLocation.region, currentLocation.country].filter(Boolean).join(', ')}
                  </p>
                </div>
                {currentWeather && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono-numbers">
                      {formatTemperature(currentWeather.temperature, settings.temperatureUnit)}
                    </div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {currentWeather.condition}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
                <button
                  onClick={handleManualRefresh}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => toggleSaveLocation(currentLocation)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isSaved
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-2">
                Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = routerLocation.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-zinc-400'}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {link.badge}
                      </span>
                    )}
                    {link.count !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono-numbers">
                        {link.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Preferences & Controls */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2">
                Quick Preferences
              </div>

              {/* Temperature Unit Switcher */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Temperature Unit
                </span>
                <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setTemperatureUnit('celsius')}
                    className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                      settings.temperatureUnit === 'celsius'
                        ? 'bg-white dark:bg-blue-600 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setTemperatureUnit('fahrenheit')}
                    className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                      settings.temperatureUnit === 'fahrenheit'
                        ? 'bg-white dark:bg-blue-600 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Interface Theme
                </span>
                <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      settings.theme === 'light'
                        ? 'bg-white text-zinc-900 shadow-sm font-bold'
                        : 'text-zinc-500'
                    }`}
                  >
                    <Sun className="w-3 h-3" /> Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-950 text-white shadow-sm font-bold'
                        : 'text-zinc-400'
                    }`}
                  >
                    <Moon className="w-3 h-3" /> Dark
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Locations Quick List */}
            {savedLocations.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-2">
                  Saved Cities
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {savedLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setCurrentLocation(loc);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        loc.name === currentLocation.name
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      {loc.cached_temp !== undefined && (
                        <span className="text-xs font-mono-numbers text-zinc-400">
                          {formatTemperature(loc.cached_temp, settings.temperatureUnit)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Telemetry */}
            <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FastAPI Telemetry Online</span>
              </div>
              <span className="font-mono">Render Free Tier</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;
