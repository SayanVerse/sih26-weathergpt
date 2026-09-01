/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from './context/SettingsContext';
import { WeatherProvider } from './context/WeatherContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { SplashScreen } from './components/layout/SplashScreen';

import { DashboardPage } from './pages/DashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { MapPage } from './pages/MapPage';
import { LocationsPage } from './pages/LocationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Initialize TanStack React Query Client with resilient defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <WeatherProvider>
          <BrowserRouter>
            <div className="h-[100dvh] w-full overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-blue-200 transition-colors duration-300">

              {/* Application Top Header */}
              <Header />

              {/* Navigation Sub-bar (Desktop Tabs & Mobile Dock) */}
              <Navigation />

              {/* Main Content Router View */}
              <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-[60px] sm:pb-0">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/locations" element={<LocationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </WeatherProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
