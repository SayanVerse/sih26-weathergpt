import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { CurrentWeather } from '../components/weather/CurrentWeather';
import { WeatherMetrics } from '../components/weather/WeatherMetrics';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { DailyForecast } from '../components/weather/DailyForecast';
import { WeatherAlert } from '../components/weather/WeatherAlert';
import { AIInsightCard } from '../components/weather/AIInsightCard';
import { TemperatureChart } from '../components/weather/TemperatureChart';
import { PrecipitationChart } from '../components/weather/PrecipitationChart';
import { WeatherAtmosphere } from '../components/weather/WeatherAtmosphere';
import { ErrorState } from '../components/ui/ErrorState';

export const DashboardPage: React.FC = () => {
  const {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    weatherAlerts,
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

  return (
    <div className="relative min-h-screen">
      {/* Dynamic weather atmosphere gradient and particles */}
      <WeatherAtmosphere
        condition={currentWeather?.condition}
        isDay={currentWeather?.is_day}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Weather Alerts / Warnings if active */}
        <WeatherAlert alertsData={weatherAlerts} />

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
