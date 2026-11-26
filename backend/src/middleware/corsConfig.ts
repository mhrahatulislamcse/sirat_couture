import cors, { CorsOptions } from 'cors';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

export function getAllowedOrigins(): string[] {
  const configured = [
    process.env.STOREFRONT_ORIGIN,
    process.env.ADMIN_ORIGIN,
    ...(process.env.ADDITIONAL_CORS_ORIGINS || '').split(','),
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));

  return Array.from(new Set([...DEFAULT_ORIGINS, ...configured]));
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server health checks, courier webhooks)
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS policy blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

export const corsMiddleware = cors(corsOptions);
