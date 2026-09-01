import { apiClient, getApiBaseUrl } from './client';
import { BackendHealthStatus } from '../types/settings';

export const systemApi = {
  /**
   * Check connection to FastAPI backend (calls /health, /api/health, or /api/weather/current)
   */
  async checkBackendHealth(): Promise<BackendHealthStatus> {
    const url = getApiBaseUrl();
    const startTime = performance.now();

    try {
      // Try /health or /api/health endpoint
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        let data: any = {};
        try {
          data = await response.json();
        } catch {
          // ignore non-json ok response
        }

        return {
          status: 'connected',
          latencyMs,
          serverVersion: data.version || 'FastAPI 0.110+',
          lastChecked: new Date().toLocaleTimeString(),
          url,
        };
      }

      return {
        status: 'error',
        latencyMs,
        errorMessage: `Server returned HTTP ${response.status}: ${response.statusText}`,
        lastChecked: new Date().toLocaleTimeString(),
        url,
      };
    } catch (error: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        status: 'disconnected',
        latencyMs,
        errorMessage: error.message || 'Connection refused or timed out',
        lastChecked: new Date().toLocaleTimeString(),
        url,
      };
    }
  },
};
