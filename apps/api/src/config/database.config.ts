import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  host: z.string().default('localhost'),
  port: z.coerce.number().default(5432),
  username: z.string().default('flama'),
  password: z.string().default('flama'),
  database: z.string().default('flama'),
});

export const databaseConfig = registerAs('database', () => {
  return schema.parse({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
});
