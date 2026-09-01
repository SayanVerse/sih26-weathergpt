import React from 'react';
import { SavedLocationsList } from '../components/locations/SavedLocationsList';
import { Bookmark, Plus, MapPin, Search } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const LocationsPage: React.FC = () => {
  const { savedLocations, currentLocation, detectUserLocation, isDetectingLocation } = useWeather();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Saved Locations & Multi-City Monitor
            </h1>
            <Badge variant="cyan" size="sm">
              {savedLocations.length} Saved
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Track and compare conditions across your frequented cities and travel destinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={detectUserLocation}
            isLoading={isDetectingLocation}
          >
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            Detect GPS
          </Button>
        </div>
      </div>

      {/* Grid of Saved Location Cards */}
      <SavedLocationsList />
    </div>
  );
};
