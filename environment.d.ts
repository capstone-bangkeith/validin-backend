declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      HOSTNAME?: string;
      PROJECT_ID: string;
      REDIS_PASS?: string;
      REDIS_HOST?: string;
      CLOUD_STORAGE_CREDS_PATH?: string;
      DATABASE_URL?: string;
      BUCKET_NAME: string;
      ADMIN_NAME: string;
      ADMIN_PW: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
