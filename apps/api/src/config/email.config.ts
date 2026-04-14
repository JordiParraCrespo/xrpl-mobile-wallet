import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  provider: z.enum(['console', 'nodemailer', 'resend']).default('console'),
  from: z.string().default('noreply@flama.dev'),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  resendApiKey: z.string().optional(),
});

export const emailConfig = registerAs('email', () => {
  return schema.parse({
    provider: process.env.EMAIL_PROVIDER,
    from: process.env.EMAIL_FROM,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    resendApiKey: process.env.RESEND_API_KEY,
  });
});
