import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationSearchResult } from '../types/location';
import { locationsApi } from '../api/locations';
import { useDebounce } from './useDebounce';
import { useSettings } from '../context/SettingsContext';

export function useLocationSearch(initialQuery: string = '') {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchTerm, 350);
  const { settings } = useSettings();

  const {
    data: results = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['location-search', debouncedSearch, settings.dataSourceMode, settings.apiBaseUrl],
    queryFn: () => locationsApi.searchLocations(debouncedSearch),
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading: isLoading || isFetching,
    isError,
    error,
    clearSearch: () => setSearchTerm(''),
  };
}
