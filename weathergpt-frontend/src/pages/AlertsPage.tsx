import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { WeatherAlert } from '../components/weather/WeatherAlert';
import { RiskAdvisoryBanner } from '../components/weather/RiskAdvisoryBanner';
import { ShieldAlert } from 'lucide-react';
import { WeatherAtmosphere } from '../components/weather/WeatherAtmosphere';

export const AlertsPage: React.FC = () => {
  const { weatherAlerts, riskAssessment, currentWeather } = useWeather();
  const totalAlerts = (weatherAlerts?.alerts?.length || 0) + (riskAssessment?.risks?.length || 0);

  return (
    <div className="relative min-h-screen">
      <WeatherAtmosphere
        condition={currentWeather?.condition}
        isDay={currentWeather?.is_day}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-red-500/10 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Active Alerts</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {totalAlerts === 0 ? 'No active alerts at this time.' : `${totalAlerts} active weather alerts and advisories.`}
            </p>
          </div>
        </div>

        <WeatherAlert alertsData={weatherAlerts} />
        <RiskAdvisoryBanner riskAssessment={riskAssessment} />
        
        {totalAlerts === 0 && (
          <div className="text-center py-12 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">All clear! There are currently no weather alerts for your area.</p>
          </div>
        )}
      </div>
    </div>
  );
};
