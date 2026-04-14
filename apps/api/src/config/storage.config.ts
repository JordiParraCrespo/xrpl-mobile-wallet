import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  provider: z.enum(['local', 's3']).default('local'),
  uploadDir: z.string().default('./uploads'),
  s3Endpoint: z.string().optional(),
  s3Region: z.string().default('auto'),
  s3Bucket: z.string().default('flama'),
  s3AccessKeyId: z.string().optional(),
  s3SecretAccessKey: z.string().optional(),
});

export const storageConfig = registerAs('storage', () => {
  return schema.parse({
    provider: process.env.STORAGE_PROVIDER,
    uploadDir: process.env.UPLOAD_DIR,
    s3Endpoint: process.env.S3_ENDPOINT,
    s3Region: process.env.S3_REGION,
    s3Bucket: process.env.S3_BUCKET,
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  });
});
