// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      ME: '/api/auth/me',
    },
    ROADMAP: {
      GENERATE: '/api/roadmap/generate',
      PROGRESS: '/api/roadmap/progress',
    },
    GAMIFICATION: {
      DAILY: '/api/gamification/daily',
    },
    PAYMENTS: {
      CREATE_ORDER: '/api/payments/create-order',
      VERIFY: '/api/payments/verify',
      STATUS: '/api/payments/status',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Auth configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'learnoir_token',
  REFRESH_TOKEN_KEY: 'learnoir_refresh_token',
  TOKEN_EXPIRY_KEY: 'learnoir_token_expiry',
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;
