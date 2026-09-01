import React from 'react';
import { Sparkles, Umbrella, Shirt, Sun, Clock, Activity } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const SUGGESTED_PROMPTS = [
  {
    icon: Umbrella,
    text: 'Will I need an umbrella today?',
    label: 'Umbrella Check',
  },
  {
    icon: Shirt,
    text: 'What should I wear today based on the forecast?',
    label: 'Attire Advisory',
  },
  {
    icon: Sun,
    text: 'Is today good for outdoor exercise and running?',
    label: 'Outdoor Activity',
  },
  {
    icon: Clock,
    text: 'When is the best time to go outside today?',
    label: 'Optimal Window',
  },
  {
    icon: Activity,
    text: 'Will rain or storms develop later this evening?',
    label: 'Evening Risk',
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>Suggested Inquiries</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.text)}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-blue-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
