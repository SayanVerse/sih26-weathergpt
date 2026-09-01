import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Sparkles, User, Send, CheckCircle2, Trash2, X, Grid, Search, Mic } from 'lucide-react';
import { useAIChat } from '../../hooks/useAIChat';
import { useWeather } from '../../context/WeatherContext';
import { useSettings } from '../../context/SettingsContext';
import { ChatMessageItem } from './ChatMessageItem';
import { SuggestedPrompts } from './SuggestedPrompts';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatTemperature } from '../../lib/utils';

export const AIChat: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearChat,
    messagesEndRef,
  } = useAIChat();

  const { currentLocation, currentWeather } = useWeather();
  const { settings } = useSettings();

  const [inputPrompt, setInputPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    // textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    sendMessage(inputPrompt);
    setInputPrompt('');
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPrompt(e.target.value);
  };

  return (
    <div className="flex flex-col h-full w-full rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 shadow-2xl overflow-hidden transition-colors duration-300 relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          {/* Animated gradient sphere logo */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 opacity-90 blur-[2px] animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/50 to-transparent mix-blend-overlay" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <button className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" title="Menu">
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={clearChat}
            className="hover:text-rose-500 transition-colors" 
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 bg-transparent">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} onRegenerate={retryLastMessage} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 sm:p-5 bg-white dark:bg-zinc-950 pb-6 flex flex-col items-center">
        {/* Suggestive Questions */}
        {!isLoading && messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4 max-w-2xl w-full">
            {[
              "Will it rain today?",
              "What should I wear?",
              "Is it good for outdoor sports?"
            ].map((q) => (
              <button
                key={q}
                onClick={() => {
                  sendMessage(q);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="relative w-full max-w-4xl mx-auto">
          <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:shadow-none focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-zinc-700 transition-all overflow-hidden pl-4 pr-16 py-1">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={inputPrompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type here..."
              className="w-full bg-transparent border-none focus:outline-none px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          {/* We use a hidden submit button so the form can submit on Enter natively */}
          <button type="submit" className="hidden" disabled={!inputPrompt.trim() || isLoading}>
            Send
          </button>
        </form>

      </div>
    </div>
  );
};
