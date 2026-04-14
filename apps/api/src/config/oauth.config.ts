import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  google: z.object({
    clientId: z.string().default('not-set'),
    clientSecret: z.string().default('not-set'),
    callbackUrl: z.string().default('http://localhost:3001/api/v1/auth/google/callback'),
  }),
  github: z.object({
    clientId: z.string().default('not-set'),
    clientSecret: z.string().default('not-set'),
    callbackUrl: z.string().default('http://localhost:3001/api/v1/auth/github/callback'),
  }),
});

export const oauthConfig = registerAs('oauth', () => {
  return schema.parse({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    },
  });
});
