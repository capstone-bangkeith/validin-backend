import { createWorker } from 'tesseract.js';

export const worker = createWorker({
  logger: (m) => console.log(m),
});

export default worker;
