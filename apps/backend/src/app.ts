import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttpModule from 'pino-http';
import { env } from '@/config/env.js';
import { logger } from '@/shared/logger/logger.js';
import { requestContext } from '@/middleware/request-context.js';
import { apiRateLimiter } from '@/middleware/rate-limit.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { notFoundHandler } from '@/middleware/not-found.js';
import apiRoutes from '@/routes/v1/index.js';

const pinoHttp = pinoHttpModule as unknown as (options: Record<string, unknown>) => express.RequestHandler;

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(requestContext);
  app.use(pinoHttp({ logger }));
  app.use(helmet());

  // Production-ready CORS configuration
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {

      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (
        origin === env.APP_ORIGIN ||           // production domain
        origin.endsWith("vercel.app") ||       // all Vercel preview deployments
        origin.includes("localhost")           // local development
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    exposedHeaders: ['Set-Cookie']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // handle preflight requests

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(apiRateLimiter);

  app.use(env.API_PREFIX, apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};