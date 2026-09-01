import React, { useMemo } from 'react';
import { getWeatherAtmosphere } from '../../lib/weather-theme';

interface WeatherAtmosphereProps {
  condition?: string;
  isDay?: boolean;
}

export const WeatherAtmosphere: React.FC<WeatherAtmosphereProps> = ({
  condition = 'Clear',
  isDay = true,
}) => {
  const theme = useMemo(() => getWeatherAtmosphere(condition, isDay), [condition, isDay]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Background ambient gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} transition-colors duration-1000`} />

      {/* Atmospheric radial glows */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-all duration-1000"
        style={{ backgroundColor: theme.accentColor }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[160px] opacity-30 transition-all duration-1000"
        style={{ backgroundColor: theme.accentColor }}
      />

      {/* Subtle particle system */}
      {theme.particleType === 'rain' && (
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[1px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent"
              style={{
                height: `${20 + (i % 5) * 10}px`,
                left: `${(i * 4) % 100}%`,
                top: `${(i * 7) % 100}%`,
                animation: `rain-fall ${0.8 + (i % 4) * 0.2}s linear infinite`,
                animationDelay: `${(i % 10) * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {theme.particleType === 'sunbeam' && isDay && (
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-b from-amber-400/10 to-transparent blur-3xl rounded-full transform -rotate-12 animate-pulse-subtle" />
      )}
    </div>
  );
};
