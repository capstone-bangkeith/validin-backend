import { Storage } from '@google-cloud/storage';

import { BUCKET_NAME } from './config';

const storage = new Storage();

export const bucket = storage.bucket(BUCKET_NAME ?? 'chumybucket');

export default storage;
