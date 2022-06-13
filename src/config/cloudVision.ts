import vision from '@google-cloud/vision';

import { BUCKET_NAME } from './config';

export const client = new vision.ImageAnnotatorClient();

export const textDetectionGcs = (filename: string) => {
  const request = {
    image: {
      source: {
        imageUri: `gs://${BUCKET_NAME}/${filename}`,
      },
    },
    imageContext: {
      languageHints: ['en', 'id'],
    },
  };
  return client.textDetection(request);
};

export default client;
