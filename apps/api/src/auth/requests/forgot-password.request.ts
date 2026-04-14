import { forgotPasswordSchema } from '@flama/shared';
import { createZodDto } from 'nestjs-zod';

export class ForgotPasswordRequest extends createZodDto(forgotPasswordSchema) {}
