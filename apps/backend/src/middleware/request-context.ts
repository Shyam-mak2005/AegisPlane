import { nanoid } from 'nanoid';
import type { NextFunction, Response } from 'express';
import type { AppRequest } from '@/types/http.js';

export const requestContext = (req: AppRequest, res: Response, next: NextFunction) => {
  req.requestId = req.header('x-request-id') ?? nanoid(12);
  res.setHeader('x-request-id', req.requestId);
  next();
};