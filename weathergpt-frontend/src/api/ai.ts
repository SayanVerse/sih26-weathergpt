import { apiClient, getDataSourceMode } from './client';
import { AIChatRequest, AIChatResponse, AIChatResponseSchema } from '../types/ai';
import { getMockAIChatResponse } from '../mocks/aiMock';

export const aiApi = {
  /**
   * POST /api/ai/chat
   */
  async sendMessage(request: AIChatRequest): Promise<AIChatResponse> {
    const mode = getDataSourceMode();

    if (mode === 'mock') {
      // Simulate natural async thinking delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return getMockAIChatResponse(request);
    }

    try {
      const data = await apiClient.post<AIChatResponse>('/api/ai/chat', {
        message: request.message,
        location: request.location
          ? {
              latitude: request.location.latitude,
              longitude: request.location.longitude,
              name: request.location.name,
            }
          : undefined,
        conversation_history: request.conversation_history,
        temperature_unit: request.temperature_unit,
        wind_unit: request.wind_unit,
        persona: request.persona,
        language: request.language,
      });

      const parsed = AIChatResponseSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }
      return data;
    } catch (error) {
      if (mode === 'auto') {
        console.warn('[WeatherGPT] FastAPI /api/ai/chat unavailable. Utilizing AI fallback.', error);
        await new Promise((resolve) => setTimeout(resolve, 800));
        return getMockAIChatResponse(request);
      }
      throw error;
    }
  },
};
