import { Response, NextFunction } from 'express';
import { RequestWithId } from './requestId.js';
import { ErrorResponse } from '@fashion-aggregator/contracts';

export function notFoundHandler(req: RequestWithId, res: Response): void {
  const requestId = req.id || 'unknown';
  const response: ErrorResponse = {
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      requestId,
    },
  };
  res.status(404).json(response);
}

export function errorHandler(
  err: any,
  req: RequestWithId,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.id || 'unknown';
  const statusCode =
    typeof err.status === 'number'
      ? err.status
      : typeof err.statusCode === 'number'
        ? err.statusCode
        : 500;

  let code = 'INTERNAL_SERVER_ERROR';
  if (statusCode === 413 || err.type === 'entity.too.large') {
    code = 'PAYLOAD_TOO_LARGE';
  } else if (statusCode === 400) {
    code = 'BAD_REQUEST';
  } else if (statusCode === 404) {
    code = 'NOT_FOUND';
  }

  const response: ErrorResponse = {
    error: {
      code,
      message:
        process.env.NODE_ENV === 'production' && statusCode === 500
          ? 'An unexpected error occurred.'
          : err.message || 'An unexpected error occurred.',
      requestId,
    },
  };
  res.status(statusCode).json(response);
}
