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

const pinoHttp = pinoHttpModule;

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(requestContext);
  app.use(pinoHttp({ logger }));
  app.use(helmet());

  // 🔥 Production-ready CORS configuration
  const corsOptions = {
    origin: (origin, callback) => {

      // allow requests like Postman or mobile apps
      if (!origin) return callback(null, true);

      if (
        origin === env.APP_ORIGIN ||     // production frontend
        origin.includes("vercel.app") || // vercel preview deployments
        origin.includes("localhost")     // local dev
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-ID"],
    exposedHeaders: ["Set-Cookie"]
  };

  app.use(cors(corsOptions));

  // handle preflight
  app.options("*", cors(corsOptions));

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(apiRateLimiter);

  app.use(env.API_PREFIX, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};