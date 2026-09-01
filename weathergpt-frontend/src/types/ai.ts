import { z } from 'zod';
import { LocationCoordinates } from './weather';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  metadata?: {
    location?: string;
    temperature?: number;
    condition?: string;
    actionableTips?: string[];
    confidence?: number;
  };
}

export interface AIChatRequest {
  message: string;
  location?: LocationCoordinates & { name?: string };
  conversation_history?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  temperature_unit?: 'celsius' | 'fahrenheit';
  wind_unit?: 'kmh' | 'mph';
  persona?: string;
  language?: string;
}

export interface AIChatResponse {
  response: string;
  insights?: string[];
  actionable_advice?: {
    attire?: string;
    outdoor_suitability?: string;
    umbrella_needed?: boolean;
    best_time_outside?: string;
  };
  sources?: string[];
}

export const AIChatResponseSchema = z.object({
  response: z.string(),
  insights: z.array(z.string()).optional(),
  actionable_advice: z.object({
    attire: z.string().optional(),
    outdoor_suitability: z.string().optional(),
    umbrella_needed: z.boolean().optional(),
    best_time_outside: z.string().optional(),
  }).optional(),
  sources: z.array(z.string()).optional(),
});
