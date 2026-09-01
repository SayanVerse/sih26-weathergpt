import { useState, useCallback, useRef, useEffect } from 'react';
import { AIChatMessage, AIChatRequest } from '../types/ai';
import { aiApi } from '../api/ai';
import { useWeather } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';

const CHAT_STORAGE_KEY = 'weathergpt_chat_history';

const DEFAULT_INITIAL_MESSAGE: AIChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Hello! I am your **WeatherGPT Intelligence Assistant**.\n\nAsk me anything about current weather dynamics, forecasts, travel advisories, clothing recommendations, or the best time for outdoor activities.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  status: 'complete',
  metadata: {
    actionableTips: [
      'Will I need an umbrella today?',
      'What should I wear this afternoon?',
      'Best time for outdoor exercise?',
    ],
  },
};

export function useAIChat() {
  const { currentLocation, currentWeather } = useWeather();
  const { settings } = useSettings();

  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading chat history', e);
    }
    return [DEFAULT_INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving chat history', e);
    }
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);
      const userMsgId = `usr-${Date.now()}`;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const userMessage: AIChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: nowStr,
        status: 'complete',
      };

      const assistantMsgId = `ast-${Date.now()}`;
      const placeholderAssistantMsg: AIChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: nowStr,
        status: 'streaming',
      };

      setMessages((prev) => [...prev, userMessage, placeholderAssistantMsg]);
      setIsLoading(true);

      try {
        const requestPayload: AIChatRequest = {
          message: trimmed,
          location: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            name: `${currentLocation.name}${currentLocation.region ? ', ' + currentLocation.region : ''}`,
          },
          conversation_history: messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-6)
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          temperature_unit: settings.temperatureUnit,
          wind_unit: settings.windSpeedUnit === 'mph' ? 'mph' : 'kmh',
          persona: settings.persona,
          language: settings.language,
        };

        const response = await aiApi.sendMessage(requestPayload);

        // Update assistant message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: response.response,
                  status: 'complete',
                  metadata: {
                    location: currentLocation.name,
                    temperature: currentWeather?.temperature,
                    condition: currentWeather?.condition,
                    actionableTips: response.insights,
                  },
                }
              : msg
          )
        );
      } catch (err: any) {
        const errMessage = err.message || 'Unable to generate AI weather insight.';
        setError(errMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `⚠️ ${errMessage}\nPlease check your backend connection or retry your question.`,
                  status: 'error',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, currentLocation, currentWeather, messages, settings]
  );

  const retryLastMessage = useCallback(() => {
    const userMsgs = messages.filter((m) => m.role === 'user');
    if (userMsgs.length > 0) {
      const last = userMsgs[userMsgs.length - 1];
      sendMessage(last.content);
    }
  }, [messages, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        ...DEFAULT_INITIAL_MESSAGE,
        id: `msg-welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearChat,
    messagesEndRef,
    scrollToBottom,
  };
}
