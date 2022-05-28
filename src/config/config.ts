import { config } from 'dotenv';
import { join as pathJoin } from 'path';

config({ path: pathJoin(__dirname, '../../.env') });

export const PORT = process.env.PORT ? +process.env.PORT : 3001;

export const PROJECT_ID = process.env.PROJECT_ID;

export const REDIS_PASS = process.env.REDIS_PASS;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_EX = 100; // REDIS EXPIRING SECONDS

export default {
  PORT,
  PROJECT_ID,
  REDIS_PASS,
  REDIS_HOST,
  REDIS_EX,
};
