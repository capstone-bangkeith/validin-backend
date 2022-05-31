import { exec } from 'child_process';
import { config } from 'dotenv';
import { join } from 'path';
import { promisify } from 'util';

config({ path: join(__dirname, '../env') });

const main = async () => {
  const execPromise = promisify(exec);

  const csvPath = join(__dirname, './kodewilayah.csv');

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('Database URL not found!!');
  }

  const cmd = `psql ${dbUrl} -c "\\copy kodewilayah FROM '${csvPath}' DELIMITER ',' CSV"`;

  const { stdout, stderr } = await execPromise(cmd);

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
