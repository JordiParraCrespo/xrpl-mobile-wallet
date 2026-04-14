import { resetPasswordSchema } from '@flama/shared';
import { createZodDto } from 'nestjs-zod';

export class ResetPasswordRequest extends createZodDto(resetPasswordSchema) {}
