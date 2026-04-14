import { loginSchema } from '@flama/shared';
import { createZodDto } from 'nestjs-zod';

export class LoginRequest extends createZodDto(loginSchema) {}
