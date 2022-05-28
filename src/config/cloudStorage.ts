import { Storage } from '@google-cloud/storage';
import path from 'path';

import { PROJECT_ID } from './config';

const storage = new Storage({
  keyFilename: path.join(__dirname, '../../cloud_storage_creds.json'),
  projectId: PROJECT_ID,
});

export default storage;
