import { config } from 'dotenv';
import { join as pathJoin } from 'path';
import yargs from 'yargs/yargs';

config({ path: pathJoin(__dirname, '../../.env') });

export const argv = yargs(process.argv.slice(2))
  .options({
    port: { type: 'number' },
  })
  .parseSync();

export const PORT = argv.port ?? (process.env.PORT ? +process.env.PORT : 3001);
export const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

export const PROJECT_ID = process.env.PROJECT_ID;

export const REDIS_PASS = process.env.REDIS_PASS;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_EX = 100; // REDIS EXPIRING SECONDS
export const CLOUD_STORAGE_CREDS_PATH = process.env.CLOUD_STORAGE_CREDS_PATH;
export const BUCKET_NAME = process.env.BUCKET_NAME;

export default {
  PORT,
  HOSTNAME,
  PROJECT_ID,
  REDIS_PASS,
  REDIS_HOST,
  REDIS_EX,
  CLOUD_STORAGE_CREDS_PATH,
  BUCKET_NAME,
};
