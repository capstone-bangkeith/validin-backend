import vision from '@google-cloud/vision';

import { BUCKET_NAME } from './config';

export const client = new vision.ImageAnnotatorClient();

export const textDetectionGcs = (filename: string, buff?: Buffer) => {
  const request = {
    image: {
      ...(!buff && {
        source: {
          imageUri: `gs://${BUCKET_NAME}/${filename}`,
        },
      }),
      ...(buff && {
        content: buff,
      }),
    },
    imageContext: {
      languageHints: ['en', 'id'],
    },
  };
  return client.textDetection(request);
};

export default client;
