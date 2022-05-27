import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.info('CONNECTED TO DB');
  })
  .catch((e) => {
    console.error(e);
  });

export default prisma;
