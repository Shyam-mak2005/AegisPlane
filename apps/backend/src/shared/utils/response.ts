import type { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, meta?: Record<string, unknown>) => {
  res.json({
    success: true,
    data,
    ...(meta ? { meta } : {})
  });
};