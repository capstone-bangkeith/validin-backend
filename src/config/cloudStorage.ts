import { Storage } from '@google-cloud/storage';
import path from 'path';

import { CLOUD_STORAGE_CREDS_PATH, PROJECT_ID } from './config';

const storage = new Storage({
  keyFilename: path.join(
    __dirname,
    CLOUD_STORAGE_CREDS_PATH ?? '../../cloud_storage_creds.json'
  ),
  projectId: PROJECT_ID,
});

export default storage;
