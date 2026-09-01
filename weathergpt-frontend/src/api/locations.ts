import { apiClient, getDataSourceMode } from './client';
import { LocationSearchResult, SavedLocation } from '../types/location';
import { MOCK_LOCATIONS } from '../mocks/locationsMock';

const SAVED_LOCATIONS_STORAGE_KEY = 'weathergpt_saved_locations';

export const locationsApi = {
  /**
   * Search locations by query string
   * GET /api/locations/search?q={query}
   */
  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const mode = getDataSourceMode();

    if (mode === 'mock') {
      const q = query.toLowerCase();
      return MOCK_LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          (loc.region && loc.region.toLowerCase().includes(q)) ||
          loc.country.toLowerCase().includes(q)
      );
    }

    try {
      const raw = await apiClient.get<any[]>('/api/locations/search', {
        q: query.trim(),
      });
      if (!Array.isArray(raw)) return [];
      // Normalize backend response — map admin1 → region if needed
      return raw.map((r): LocationSearchResult => ({
        id: r.id ?? String(r.latitude) + ',' + String(r.longitude),
        name: r.name ?? '',
        region: r.region ?? r.admin1 ?? '',
        country: r.country ?? '',
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone,
      }));
    } catch (error) {
      if (mode === 'auto') {
        const q = query.toLowerCase();
        return MOCK_LOCATIONS.filter(
          (loc) =>
            loc.name.toLowerCase().includes(q) ||
            (loc.region && loc.region.toLowerCase().includes(q)) ||
            loc.country.toLowerCase().includes(q)
        );
      }
      throw error;
    }
  },

  /**
   * Get saved locations list
   * GET /api/locations/saved
   */
  async getSavedLocations(): Promise<SavedLocation[]> {
    const mode = getDataSourceMode();

    // In client-assisted mode or mock, read from local persistence
    if (mode === 'mock' || mode === 'auto') {
      try {
        const saved = localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error loading saved locations from storage', e);
      }

      // Default starter locations
      const initial: SavedLocation[] = [
        {
          id: 'loc-sf',
          name: 'San Francisco',
          region: 'California',
          country: 'United States',
          latitude: 37.7749,
          longitude: -122.4194,
          is_favorite: true,
          cached_temp: 18,
          cached_condition: 'Partly Cloudy',
          cached_icon: 'cloud-sun',
        },
        {
          id: 'loc-tokyo',
          name: 'Tokyo',
          region: 'Kanto',
          country: 'Japan',
          latitude: 35.6762,
          longitude: 139.6503,
          is_favorite: true,
          cached_temp: 24,
          cached_condition: 'Clear',
          cached_icon: 'sun',
        },
        {
          id: 'loc-london',
          name: 'London',
          region: 'Greater London',
          country: 'United Kingdom',
          latitude: 51.5074,
          longitude: -0.1278,
          is_favorite: false,
          cached_temp: 14,
          cached_condition: 'Rain',
          cached_icon: 'cloud-rain',
        },
      ];
      localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    try {
      return await apiClient.get<SavedLocation[]>('/api/locations/saved');
    } catch (error) {
      const saved = localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      throw error;
    }
  },

  /**
   * Save a new location to user's saved list
   * POST /api/locations/saved
   */
  async saveLocation(location: Omit<SavedLocation, 'id'>): Promise<SavedLocation> {
    const newLoc: SavedLocation = {
      ...location,
      id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      last_updated: new Date().toISOString(),
    };

    const mode = getDataSourceMode();
    if (mode === 'mock' || mode === 'auto') {
      const saved = await this.getSavedLocations();
      const exists = saved.find(
        (l) =>
          l.name.toLowerCase() === newLoc.name.toLowerCase() &&
          l.country.toLowerCase() === newLoc.country.toLowerCase()
      );
      if (!exists) {
        const updated = [...saved, newLoc];
        localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
      }
      return newLoc;
    }

    return await apiClient.post<SavedLocation>('/api/locations/saved', newLoc);
  },

  /**
   * Delete a saved location
   * DELETE /api/locations/saved/{id}
   */
  async deleteLocation(id: string): Promise<{ success: boolean }> {
    const mode = getDataSourceMode();
    if (mode === 'mock' || mode === 'auto') {
      const saved = await this.getSavedLocations();
      const updated = saved.filter((l) => l.id !== id);
      localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    }

    return await apiClient.delete<{ success: boolean }>(`/api/locations/saved/${id}`);
  },
};
