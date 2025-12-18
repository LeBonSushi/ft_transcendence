// Runtime configuration that works on the client side
export const config = {
  apiUrl: typeof window !== 'undefined'
    ? (window as any).__ENV__?.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',

  wsUrl: typeof window !== 'undefined'
    ? (window as any).__ENV__?.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
    : process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
} as const;

// Get the base URL without /api suffix
export const getApiBaseUrl = () => {
  return config.apiUrl;
};
