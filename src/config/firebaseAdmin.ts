import { App, applicationDefault, initializeApp } from 'firebase-admin/app';

let firebase: App | undefined = undefined;

export const initFirebase = () => {
  firebase = initializeApp({
    credential: applicationDefault(),
  });
};

export default firebase;
