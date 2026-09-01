import { apiClient, getDataSourceMode } from './client';
import {
  CurrentWeatherResponse,
  HourlyForecastResponse,
  DailyForecastResponse,
  WeatherAlertsResponse,
  AIInsightData,
  LocationInfo,
  CurrentWeatherSchema,
} from '../types/weather';
import {
  getMockCurrentWeather,
  getMockHourlyForecast,
  getMockDailyForecast,
  getMockWeatherAlerts,
  getMockAIInsights,
} from '../mocks/weatherMock';

/**
 * Build query params object including optional location metadata.
 * The backend uses name/country/region to populate the `location` object in the response.
 */
function buildLocationParams(
  latitude: number,
  longitude: number,
  locationMeta?: Partial<LocationInfo>
): Record<string, any> {
  const params: Record<string, any> = { lat: latitude, lon: longitude };
  if (locationMeta?.name) params.name = locationMeta.name;
  if (locationMeta?.country) params.country = locationMeta.country;
  if (locationMeta?.region) params.region = locationMeta.region;
  if (locationMeta?.timezone) params.timezone = locationMeta.timezone;
  return params;
}

function makeFallbackLoc(
  latitude: number,
  longitude: number,
  locationMeta?: Partial<LocationInfo>
): LocationInfo {
  return {
    name: locationMeta?.name || 'Local Area',
    region: locationMeta?.region || '',
    country: locationMeta?.country || 'Region',
    latitude,
    longitude,
  };
}

export const weatherApi = {
  /**
   * GET /api/weather/current?lat={lat}&lon={lon}[&name=&country=&region=]
   * Returns CurrentWeatherResponse.
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number,
    locationMeta?: Partial<LocationInfo>
  ): Promise<CurrentWeatherResponse> {
    const mode = getDataSourceMode();

    if (mode === 'mock') {
      return getMockCurrentWeather(makeFallbackLoc(latitude, longitude, locationMeta));
    }

    try {
      const data = await apiClient.get<CurrentWeatherResponse>(
        '/api/weather/current',
        buildLocationParams(latitude, longitude, locationMeta)
      );

      // Patch location into response if backend didn't include metadata
      if (data && !data.location?.name && locationMeta?.name) {
        data.location = {
          name: locationMeta.name,
          region: locationMeta.region,
          country: locationMeta.country || '',
          latitude,
          longitude,
          timezone: locationMeta.timezone,
        };
      }

      // Runtime validation via Zod
      const parsed = CurrentWeatherSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data as CurrentWeatherResponse;
      }
      return data;
    } catch (error) {
      if (mode === 'auto') {
        console.warn('[WeatherGPT] FastAPI unavailable for /api/weather/current. Using mock fallback.', error);
        return getMockCurrentWeather(makeFallbackLoc(latitude, longitude, locationMeta));
      }
      throw error;
    }
  },

  /**
   * GET /api/weather/hourly?lat={lat}&lon={lon}[&name=&country=&region=]
   * Returns HourlyForecastResponse: { location, hourly: [...] }
   */
  async getHourlyForecast(
    latitude: number,
    longitude: number,
    locationMeta?: Partial<LocationInfo>
  ): Promise<HourlyForecastResponse> {
    const mode = getDataSourceMode();

    if (mode === 'mock') {
      return getMockHourlyForecast(makeFallbackLoc(latitude, longitude, locationMeta));
    }

    try {
      const data = await apiClient.get<HourlyForecastResponse>(
        '/api/weather/hourly',
        buildLocationParams(latitude, longitude, locationMeta)
      );

      // Patch location if missing
      if (data && !data.location?.name && locationMeta?.name) {
        data.location = {
          name: locationMeta.name,
          region: locationMeta.region,
          country: locationMeta.country || '',
          latitude,
          longitude,
        };
      }

      return data;
    } catch (error) {
      if (mode === 'auto') {
        console.warn('[WeatherGPT] FastAPI unavailable for /api/weather/hourly. Using mock fallback.', error);
        return getMockHourlyForecast(makeFallbackLoc(latitude, longitude, locationMeta));
      }
      throw error;
    }
  },

  /**
   * GET /api/weather/forecast?lat={lat}&lon={lon} (Daily 7-Day Forecast)
   * Returns DailyForecastResponse: { location, forecast: [...] }
   */
  async getDailyForecast(
    latitude: number,
    longitude: number,
    locationMeta?: Partial<LocationInfo>
  ): Promise<DailyForecastResponse> {
    const mode = getDataSourceMode();

    if (mode === 'mock') {
      return getMockDailyForecast(makeFallbackLoc(latitude, longitude, locationMeta));
    }

    try {
      const data = await apiClient.get<DailyForecastResponse>(
        '/api/weather/forecast',
        buildLocationParams(latitude, longitude, locationMeta)
      );

      // Patch location if missing
      if (data && !data.location?.name && locationMeta?.name) {
        data.location = {
          name: locationMeta.name,
          region: locationMeta.region,
          country: locationMeta.country || '',
          latitude,
          longitude,
        };
      }

      return data;
    } catch (error) {
      if (mode === 'auto') {
        console.warn('[WeatherGPT] FastAPI unavailable for /api/weather/forecast. Using mock fallback.', error);
        return getMockDailyForecast(makeFallbackLoc(latitude, longitude, locationMeta));
      }
      throw error;
    }
  },

  /**
   * GET /api/weather/alerts?lat={lat}&lon={lon}
   * Returns WeatherAlertsResponse: { location, alerts: [] }
   */
  async getWeatherAlerts(
    latitude: number,
    longitude: number,
    locationMeta?: Partial<LocationInfo>
  ): Promise<WeatherAlertsResponse> {
    const mode = getDataSourceMode();

    if (mode === 'mock') {
      return getMockWeatherAlerts(makeFallbackLoc(latitude, longitude, locationMeta));
    }

    try {
      return await apiClient.get<WeatherAlertsResponse>('/api/weather/alerts', {
        lat: latitude,
        lon: longitude,
      });
    } catch (error) {
      if (mode === 'auto') {
        return getMockWeatherAlerts(makeFallbackLoc(latitude, longitude, locationMeta));
      }
      throw error;
    }
  },

  /**
   * GET /api/weather/insights?lat={lat}&lon={lon}
   * Returns AIInsightData.
   */
  async getAIInsights(
    latitude: number,
    longitude: number,
    currentWeather?: CurrentWeatherResponse
  ): Promise<AIInsightData> {
    const mode = getDataSourceMode();

    if (mode === 'mock') {
      const loc: LocationInfo = {
        name: currentWeather?.location?.name || 'Local Area',
        country: currentWeather?.location?.country || '',
        latitude,
        longitude,
      };
      const cur = currentWeather || getMockCurrentWeather(loc);
      return getMockAIInsights(loc, cur);
    }

    try {
      return await apiClient.get<AIInsightData>('/api/weather/insights', {
        lat: latitude,
        lon: longitude,
      });
    } catch (error) {
      if (mode === 'auto') {
        const loc: LocationInfo = {
          name: currentWeather?.location?.name || 'Local Area',
          country: currentWeather?.location?.country || '',
          latitude,
          longitude,
        };
        const cur = currentWeather || getMockCurrentWeather(loc);
        return getMockAIInsights(loc, cur);
      }
      throw error;
    }
  },
};
