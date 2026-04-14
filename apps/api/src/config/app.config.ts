import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  port: z.coerce.number().default(3001),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  jwtSecret: z.string().min(8),
  jwtRefreshSecret: z.string().min(8),
  frontendUrl: z.string().url().default('http://localhost:3000'),
});

export const appConfig = registerAs('app', () => {
  return schema.parse({
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
  });
});
