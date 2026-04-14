import { registerSchema } from '@flama/shared';
import { createZodDto } from 'nestjs-zod';

export class RegisterRequest extends createZodDto(registerSchema) {}
