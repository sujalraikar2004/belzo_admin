export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || import.meta.env.NEXT_PUBLIC_SOCKET_URL || 'wss://socket.belzo.internal',
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false' && (import.meta.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'),
  clusterVersion: 'Cluster v4.8.2',
  environment: 'PROD',
  activeRegion: 'BLR-CENTRAL-01',
  supportLatencyMs: 42,
  cities: ['Bengaluru', 'Pune', 'Mumbai', 'Hyderabad'],
};
