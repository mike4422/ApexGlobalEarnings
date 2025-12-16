// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[ERROR]', err);

  if (res.headersSent) return;

  const status = err?.status ?? 500;
  const message = err?.message ?? 'Internal server error';

  res.status(status).json({ error: message });
}
