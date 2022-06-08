import { applicationDefault, initializeApp } from 'firebase-admin/app';

export const app = initializeApp({
  credential: applicationDefault(),
});

export default app;
