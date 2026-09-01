/**
 * WeatherGPT Centralized API Client
 * Standardized HTTP client for Python FastAPI backend integration.
 * Base URL defaults to VITE_API_BASE_URL (e.g. http://localhost:8000)
 */

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number = 0, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

// Get configured API base URL (from env or runtime localStorage override)
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('weathergpt_api_base_url');
    if (customUrl) return customUrl.replace(/\/+$/, '');
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'http://localhost:8000';
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('weathergpt_api_base_url', url.trim());
  }
}

export function getDataSourceMode(): 'auto' | 'fastapi' | 'mock' {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('weathergpt_data_source');
    if (mode === 'fastapi' || mode === 'mock' || mode === 'auto') return mode;
  }
  return 'auto';
}

export function setDataSourceMode(mode: 'auto' | 'fastapi' | 'mock'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('weathergpt_data_source', mode);
  }
}

class HttpClient {
  private timeoutMs: number = 30000;

  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response body if present
      let data: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = text;
        }
      }

      if (!response.ok) {
        const errorMessage =
          (data && (data.detail || data.message || data.error)) ||
          `HTTP Error ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out while connecting to FastAPI backend.', 408);
      }
      throw new ApiError(
        error.message || 'Unable to connect to weather service.',
        0,
        error
      );
    }
  }

  public get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          queryParams.append(key, String(val));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `${endpoint.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new HttpClient();
