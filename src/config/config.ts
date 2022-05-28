import { config } from 'dotenv';
import { join as pathJoin } from 'path';

config({ path: pathJoin(__dirname, '../../.env') });

export const PORT = process.env.PORT ? +process.env.PORT : 3001;

export const PROJECT_ID = process.env.PROJECT_ID;

export default {
  PORT,
  PROJECT_ID,
};
