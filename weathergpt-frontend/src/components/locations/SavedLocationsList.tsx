import React from 'react';
import { MapPin, Bookmark, Trash2, ArrowUpRight, Compass, Plus, Sparkles } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSettings } from '../../context/SettingsContext';
import { SavedLocation } from '../../types/location';
import { formatTemperature } from '../../lib/utils';
import { WeatherIcon } from '../ui/WeatherIcon';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

export const SavedLocationsList: React.FC = () => {
  const {
    savedLocations,
    currentLocation,
    setCurrentLocation,
    removeSavedLocation,
    currentWeather,
  } = useWeather();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSelectLocation = (loc: SavedLocation) => {
    setCurrentLocation({
      name: loc.name,
      region: loc.region,
      country: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    navigate('/');
  };

  if (savedLocations.length === 0) {
    return (
      <Card className="text-center p-8 bg-zinc-900/60 border-zinc-800">
        <Bookmark className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-200 mb-1">No Saved Locations Yet</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
          Save your favorite cities to quickly switch between forecasts, monitor atmospheric trends, and compare conditions.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {savedLocations.map((loc) => {
        const isCurrent =
          loc.name.toLowerCase() === currentLocation.name.toLowerCase() &&
          loc.country.toLowerCase() === currentLocation.country.toLowerCase();

        return (
          <Card
            key={loc.id}
            className={`p-5 relative group transition-all duration-200 ${
              isCurrent
                ? 'bg-zinc-900 border-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-zinc-900/70 hover:bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-semibold text-zinc-100 group-hover:text-blue-300 transition-colors">
                    {loc.name}
                  </h4>
                  {isCurrent && (
                    <Badge variant="blue" size="sm">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  {[loc.region, loc.country].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <WeatherIcon
                  name={loc.cached_condition || 'Clear'}
                  className="w-6 h-6"
                />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-zinc-100 font-mono-numbers">
                  {loc.cached_temp !== undefined
                    ? formatTemperature(loc.cached_temp, settings.temperatureUnit)
                    : '--'}
                </span>
                <span className="text-xs text-zinc-400 ml-2">
                  {loc.cached_condition || 'Atmospheric telemetry'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
              <span className="text-[11px] font-mono text-zinc-500">
                {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedLocation(loc.id);
                  }}
                  className="h-7 w-7 text-zinc-500 hover:text-rose-400 p-0 hover:bg-zinc-800"
                  title="Remove from saved"
                  aria-label="Remove saved city"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant={isCurrent ? 'subtle' : 'primary'}
                  size="sm"
                  onClick={() => handleSelectLocation(loc)}
                  className="text-xs font-semibold py-1 px-2.5 h-7"
                >
                  <span>{isCurrent ? 'Viewing' : 'Switch'}</span>
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
