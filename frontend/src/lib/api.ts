import { API_CONFIG, AUTH_CONFIG } from '@/config/api';

type ApiResponse<T = any> =
  | { data: T; error?: never }
  | { data?: never; error: string };

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private token: string | null = null;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.loadToken();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      // Implement token refresh logic if needed
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  public clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
      this.token = null;
      window.location.href = '/auth/signin';
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401) {
        // For login endpoint, don't call clearAuth - just return the actual error
        if (endpoint === API_CONFIG.ENDPOINTS.AUTH.LOGIN) {
          const errorData = await response.json().catch(() => ({}));
          return { error: errorData.detail || 'Invalid email or password' };
        }

        // For other endpoints, try refresh or clear auth
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.request<T>(endpoint, options);
        }
        this.clearAuth();
        return { error: 'Session expired. Please log in again.' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail ||
          errorData.message ||
          `HTTP error! status: ${response.status}`;
        return { error: errorMessage };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType?.includes('application/json')) {
        return { data: {} as T };
      }

      const data = await response.json();
      return { data };

    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  // Auth methods
  public async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ access_token: string }>> {
    const result = await this.request<{ access_token: string }>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (result.data?.access_token) {
      this.token = result.data.access_token;
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, this.token);
      }
      return { data: { access_token: this.token } };
    }

    return result;
  }

  public async getCurrentUser() {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // Roadmap methods
  public async generateRoadmap(data: any) {
    return this.request(API_CONFIG.ENDPOINTS.ROADMAP.GENERATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateTaskProgress(data: {
    roadmap_id: string;
    week_idx: number;
    task_name: string;
    status: boolean;
  }) {
    return this.request(API_CONFIG.ENDPOINTS.ROADMAP.PROGRESS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payment methods
  public async createPaymentOrder() {
    return this.request<{ order_id: string; amount: number; currency: string; key_id: string }>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_ORDER,
      { method: 'POST' }
    );
  }

  public async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.request<{ success: boolean; plan: string; message: string }>(
      API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  public async getSubscriptionStatus() {
    return this.request<{ subscription_plan: string; is_premium: boolean }>(
      API_CONFIG.ENDPOINTS.PAYMENTS.STATUS
    );
  }
}

// Export a singleton instance
export const api = ApiClient.getInstance();

// Helper function for making API requests - used by components
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const baseUrl = API_CONFIG.BASE_URL;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);

  // Get token from localStorage if available
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
      return { data: null, error: errorMessage };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { data: {}, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error instanceof ApiError) {
    console.error(`API Error (${error.status}):`, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
  throw error;
};

export default {
  api,
  apiRequest,
  handleApiError,
};
