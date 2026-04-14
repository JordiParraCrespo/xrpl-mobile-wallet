import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  host: z.string().default('localhost'),
  port: z.coerce.number().default(6379),
});

export const redisConfig = registerAs('redis', () => {
  return schema.parse({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });
});
