import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LocationInfo,
  CurrentWeatherResponse,
  HourlyForecastResponse,
  DailyForecastResponse,
  WeatherAlertsResponse,
  AIInsightData,
} from '../types/weather';
import { SavedLocation } from '../types/location';
import { weatherApi } from '../api/weather';
import { locationsApi } from '../api/locations';
import { useSettings } from './SettingsContext';

interface WeatherContextType {
  currentLocation: LocationInfo;
  setCurrentLocation: (loc: LocationInfo) => void;
  savedLocations: SavedLocation[];
  currentWeather: CurrentWeatherResponse | undefined;
  hourlyForecast: HourlyForecastResponse | undefined;
  dailyForecast: DailyForecastResponse | undefined;
  weatherAlerts: WeatherAlertsResponse | undefined;
  aiInsights: AIInsightData | undefined;
  isLoadingWeather: boolean;
  isWeatherError: boolean;
  weatherErrorMessage: string | null;
  refreshAll: () => Promise<void>;
  detectUserLocation: () => Promise<void>;
  isDetectingLocation: boolean;
  locationDetectionError: string | null;
  toggleSaveLocation: (loc: LocationInfo) => Promise<void>;
  isLocationSaved: (loc: LocationInfo) => boolean;
  removeSavedLocation: (id: string) => Promise<void>;
}

const DEFAULT_LOCATION: LocationInfo = {
  name: 'San Francisco',
  region: 'California',
  country: 'United States',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles',
};

const LAST_LOCATION_KEY = 'weathergpt_last_location';

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  const [currentLocation, setCurrentLocationState] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem(LAST_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading last location', e);
    }
    return DEFAULT_LOCATION;
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectionError, setLocationDetectionError] = useState<string | null>(null);

  const setCurrentLocation = (loc: LocationInfo) => {
    setCurrentLocationState(loc);
    try {
      localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc));
    } catch (e) {
      console.error('Error saving last location', e);
    }
  };

  // Automatically detect location on website load
  useEffect(() => {
    detectUserLocation();
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Queries for weather data with TanStack Query
  const lat = currentLocation.latitude;
  const lon = currentLocation.longitude;
  const locName = currentLocation.name;

  // 1. Current Weather
  const {
    data: currentWeather,
    isLoading: isLoadingCurrent,
    isError: isErrorCurrent,
    error: errorCurrent,
    refetch: refetchCurrent,
  } = useQuery({
    queryKey: ['weather', 'current', lat, lon, settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => weatherApi.getCurrentWeather(lat, lon, currentLocation),
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    retry: 1,
  });

  // 2. Hourly Forecast
  const {
    data: hourlyForecast,
    isLoading: isLoadingHourly,
    refetch: refetchHourly,
  } = useQuery({
    queryKey: ['weather', 'hourly', lat, lon, settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => weatherApi.getHourlyForecast(lat, lon, currentLocation),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // 3. Daily Forecast
  const {
    data: dailyForecast,
    isLoading: isLoadingDaily,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ['weather', 'daily', lat, lon, settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => weatherApi.getDailyForecast(lat, lon, currentLocation),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // 4. Weather Alerts
  const {
    data: weatherAlerts,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['weather', 'alerts', lat, lon, settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => weatherApi.getWeatherAlerts(lat, lon, currentLocation),
    staleTime: 1000 * 60 * 10,
  });

  // 5. AI Insights
  const {
    data: aiInsights,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ['weather', 'insights', lat, lon, currentWeather?.temperature, settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => weatherApi.getAIInsights(lat, lon, currentWeather),
    staleTime: 1000 * 60 * 5,
    enabled: !!currentWeather,
  });

  // 6. Saved Locations
  const { data: savedLocations = [], refetch: refetchSaved } = useQuery({
    queryKey: ['locations', 'saved', settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => locationsApi.getSavedLocations(),
  });

  const isLoadingWeather = isLoadingCurrent || isLoadingHourly || isLoadingDaily;
  const isWeatherError = isErrorCurrent;
  const weatherErrorMessage = errorCurrent ? (errorCurrent as Error).message : null;

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      refetchCurrent(),
      refetchHourly(),
      refetchDaily(),
      refetchAlerts(),
      refetchInsights(),
      refetchSaved(),
    ]);
  }, [refetchCurrent, refetchHourly, refetchDaily, refetchAlerts, refetchInsights, refetchSaved]);

  // Geolocation detection
  const detectUserLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    setLocationDetectionError(null);

    const GEOCODE_KEY = (import.meta as any).env?.VITE_GEOCODE_API_KEY || '';

    if (!navigator.geolocation) {
      setLocationDetectionError('Geolocation is not supported by your browser.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log('📍 Current Location Coordinates:');
        console.log(`   Latitude:  ${latitude}`);
        console.log(`   Longitude: ${longitude}`);
        console.log(`   Maps URL:  https://maps.google.com/?q=${latitude},${longitude}`);

        // Show temporary placeholder
        setCurrentLocation({ name: 'Detecting...', region: '', country: '', latitude, longitude });

        try {
          let resolvedName = '';
          let resolvedRegion = '';
          let resolvedCountry = '';

          // 1. Try BigDataCloud Client Geocoding (Free, instant, accurate)
          try {
            const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(bdcUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              resolvedName = data.city || data.locality || data.principalSubdivision || '';
              resolvedRegion = data.principalSubdivision || '';
              resolvedCountry = data.countryName || '';
            }
          } catch (e) {
            console.warn('BigDataCloud reverse geocode attempt failed, trying OSM...', e);
          }

          // 2. Fallback to OpenStreetMap Nominatim if needed
          if (!resolvedName) {
            try {
              const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 4000);
              const res = await fetch(osmUrl, {
                signal: controller.signal,
                headers: { 'Accept-Language': 'en' },
              });
              clearTimeout(timeoutId);

              if (res.ok) {
                const data = await res.json();
                const addr = data.address || {};
                resolvedName =
                  addr.city ||
                  addr.town ||
                  addr.village ||
                  addr.suburb ||
                  addr.county ||
                  addr.state_district ||
                  '';
                resolvedRegion = addr.state || addr.state_district || '';
                resolvedCountry = addr.country || '';
              }
            } catch (e) {
              console.warn('Nominatim reverse geocode attempt failed...', e);
            }
          }

          console.log(`✅ Setting detected location: ${resolvedName}, ${resolvedRegion}, ${resolvedCountry}`);
          setCurrentLocation({
            name: resolvedName || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            region: resolvedRegion,
            country: resolvedCountry,
            latitude,
            longitude,
          });
        } catch (err) {
          console.error('⚠️ Geocoding failed or timed out. Falling back to coordinates.', err);
          setCurrentLocation({
            name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            region: '',
            country: '',
            latitude,
            longitude,
          });
        }

        setIsDetectingLocation(false);
      },
      (error) => {
        setIsDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationDetectionError('Location access was denied. Please allow location permissions in your browser.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationDetectionError('Location information is currently unavailable.');
            break;
          case error.TIMEOUT:
            setLocationDetectionError('The request to get user location timed out.');
            break;
          default:
            setLocationDetectionError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const isLocationSaved = useCallback(
    (loc: LocationInfo) => {
      return savedLocations.some(
        (s) =>
          s.name.toLowerCase() === loc.name.toLowerCase() &&
          s.country.toLowerCase() === loc.country.toLowerCase()
      );
    },
    [savedLocations]
  );

  const toggleSaveLocation = useCallback(
    async (loc: LocationInfo) => {
      const existing = savedLocations.find(
        (s) =>
          s.name.toLowerCase() === loc.name.toLowerCase() &&
          s.country.toLowerCase() === loc.country.toLowerCase()
      );

      if (existing) {
        await locationsApi.deleteLocation(existing.id);
      } else {
        await locationsApi.saveLocation({
          name: loc.name,
          region: loc.region,
          country: loc.country,
          latitude: loc.latitude,
          longitude: loc.longitude,
          is_favorite: true,
          cached_temp: currentWeather?.temperature,
          cached_condition: currentWeather?.condition,
          cached_icon: currentWeather?.icon,
        });
      }
      refetchSaved();
    },
    [savedLocations, currentWeather, refetchSaved]
  );

  const removeSavedLocation = useCallback(
    async (id: string) => {
      await locationsApi.deleteLocation(id);
      refetchSaved();
    },
    [refetchSaved]
  );

  return (
    <WeatherContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        savedLocations,
        currentWeather,
        hourlyForecast,
        dailyForecast,
        weatherAlerts,
        aiInsights,
        isLoadingWeather,
        isWeatherError,
        weatherErrorMessage,
        refreshAll,
        detectUserLocation,
        isDetectingLocation,
        locationDetectionError,
        toggleSaveLocation,
        isLocationSaved,
        removeSavedLocation,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
