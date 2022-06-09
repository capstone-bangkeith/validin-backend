import buildApp from './app';
import config from './config/config';

(async () => {
  const server = await buildApp();

  server.ready((err) => {
    if (err) {
      server.log.error(err);
    }
  });

  server.listen({ port: config.PORT, host: config.HOSTNAME }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
})().catch((e) => console.error(e));
