import React from 'react';
import { AIChat } from '../components/assistant/AIChat';
import { Sparkles, Bot, ShieldCheck, Zap } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { Badge } from '../components/ui/Badge';

export const AssistantPage: React.FC = () => {
  const { currentLocation } = useWeather();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 w-full min-h-0 flex flex-col overflow-hidden">
      {/* Main Chat Interface */}
      <AIChat />
    </div>
  );
};
