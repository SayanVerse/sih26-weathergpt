import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { CurrentWeather } from '../components/weather/CurrentWeather';
import { WeatherMetrics } from '../components/weather/WeatherMetrics';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DailyForecast } from '../components/weather/DailyForecast';
import { WeatherAlert } from '../components/weather/WeatherAlert';
import { RiskAdvisoryBanner } from '../components/weather/RiskAdvisoryBanner';
import { AIInsightCard } from '../components/weather/AIInsightCard';
import { TemperatureChart } from '../components/weather/TemperatureChart';
import { PrecipitationChart } from '../components/weather/PrecipitationChart';
import { WeatherAtmosphere } from '../components/weather/WeatherAtmosphere';
import { ErrorState } from '../components/ui/ErrorState';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    weatherAlerts,
    riskAssessment,
    aiInsights,
    isLoadingWeather,
    isWeatherError,
    weatherErrorMessage,
    refreshAll,
  } = useWeather();

  if (isWeatherError && !currentWeather) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState
          title="Weather Service is Currently Unavailable"
          message={
            weatherErrorMessage ||
            'Failed to establish connection to the FastAPI meteorological API endpoints. Verify that your FastAPI backend is running.'
          }
          onRetry={refreshAll}
        />
      </div>
    );
  }

  const maxAlerts = 2;
  const numWeatherAlerts = weatherAlerts?.alerts?.length || 0;
  const numRiskAlerts = riskAssessment?.risks?.length || 0;
  const totalAlerts = numWeatherAlerts + numRiskAlerts;

  const displayWeatherAlerts = weatherAlerts ? { ...weatherAlerts, alerts: weatherAlerts.alerts.slice(0, maxAlerts) } : undefined;
  const remainingSlots = Math.max(0, maxAlerts - (displayWeatherAlerts?.alerts?.length || 0));
  const displayRiskAssessment = riskAssessment ? { ...riskAssessment, risks: riskAssessment.risks.slice(0, remainingSlots) } : undefined;

  return (
    <div className="relative min-h-screen">
      {/* Dynamic weather atmosphere gradient and particles */}
      <WeatherAtmosphere
        condition={currentWeather?.condition}
        isDay={currentWeather?.is_day}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Weather Alerts / Warnings if active (Government/Source) */}
        <WeatherAlert alertsData={displayWeatherAlerts} />

        {/* Phase 9: Risk Advisory Banner (Deterministic Risk Engine) */}
        <RiskAdvisoryBanner riskAssessment={displayRiskAssessment} />

        {totalAlerts > maxAlerts && (
          <div className="flex justify-end -mt-2 mb-4">
            <Link to="/alerts" className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-500/10 backdrop-blur-sm">
              More alerts ({totalAlerts - maxAlerts}) <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <CurrentWeather
          current={currentWeather}
          daily={dailyForecast}
          isLoading={isLoadingWeather}
        />

        {/* Meteorological Metrics Grid */}
        <WeatherMetrics
          current={currentWeather}
          isLoading={isLoadingWeather}
        />

        {/* AI Insight Card */}
        <AIInsightCard
          insights={aiInsights}
          isLoading={isLoadingWeather}
        />

        {/* 24h Hourly Forecast Scroll */}
        <HourlyForecast
          hourly={hourlyForecast}
          isLoading={isLoadingWeather}
        />

        {/* Charts & Trends Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TemperatureChart
            hourly={hourlyForecast}
            isLoading={isLoadingWeather}
          />
          <PrecipitationChart
            hourly={hourlyForecast}
            isLoading={isLoadingWeather}
          />
        </div>

        {/* 7-Day Extended Forecast */}
        <DailyForecast
          daily={dailyForecast}
          isLoading={isLoadingWeather}
        />
      </div>
    </div>
  );
};
