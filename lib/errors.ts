/**
 * lib/errors.ts — Custom Application Error Classes
 *
 * Provides typed error classes for authentication and authorization failures,
 * plus a shared utility to convert them into standardized JSON API responses.
 *
 * Standard error response shape:
 *   { success: false, message: string, errors: [] }
 */

import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Error Classes
// ---------------------------------------------------------------------------

/** 401 Unauthenticated — no valid session */
export class AuthError extends Error {
  readonly statusCode = 401;

  constructor(message = 'Authentication required. Please log in.') {
    super(message);
    this.name = 'AuthError';
  }
}

/** 403 Forbidden — authenticated but insufficient permissions */
export class ForbiddenError extends Error {
  readonly statusCode = 403;

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** 404 Not Found */
export class NotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message = 'The requested resource was not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** 422 Validation Error */
export class ValidationError extends Error {
  readonly statusCode = 422;
  readonly errors: unknown[];

  constructor(message = 'Validation failed.', errors: unknown[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ---------------------------------------------------------------------------
// Standard API Error Response
// ---------------------------------------------------------------------------

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors: unknown[];
};

/**
 * Converts known application errors into a standard JSON NextResponse.
 * Falls back to 500 Internal Server Error for unknown errors.
 *
 * Usage in API routes:
 *   try {
 *     await requirePermission('attendance.write');
 *     // ... handler logic
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: [] },
      { status: 401 }
    );
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: [] },
      { status: 403 }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: [] },
      { status: 404 }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: error.errors },
      { status: 422 }
    );
  }

  // Unknown error — log server-side, return generic 500
  console.error('[API Error]', error);
  return NextResponse.json(
    { success: false, message: 'An internal server error occurred.', errors: [] },
    { status: 500 }
  );
}
