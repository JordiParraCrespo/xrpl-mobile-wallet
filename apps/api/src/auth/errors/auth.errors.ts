import type { ErrorDefinition } from '@flama/backend-core';
import { HttpStatus } from '@nestjs/common';

export const AuthErrors = {
  EMAIL_ALREADY_IN_USE: {
    code: 'AUTH_001',
    message: 'Email already in use',
    httpStatus: HttpStatus.CONFLICT,
  },
  INVALID_CREDENTIALS: {
    code: 'AUTH_002',
    message: 'Invalid credentials',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  INVALID_RESET_TOKEN: {
    code: 'AUTH_003',
    message: 'Invalid or expired reset token',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  ACCESS_DENIED: {
    code: 'AUTH_004',
    message: 'Access denied',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
} as const satisfies Record<string, ErrorDefinition>;
