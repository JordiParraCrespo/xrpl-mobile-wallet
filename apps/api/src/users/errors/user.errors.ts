import type { ErrorDefinition } from '@flama/backend-core';
import { HttpStatus } from '@nestjs/common';

export const UserErrors = {
  NOT_FOUND: {
    code: 'USER_001',
    message: 'User not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
} as const satisfies Record<string, ErrorDefinition>;
