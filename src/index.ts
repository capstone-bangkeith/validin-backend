import buildApp from './app';
import config from './config/config';

(async () => {
  const server = await buildApp();

  server.ready((err) => {
    if (err) {
      server.log.error(err);
    }
  });

  server.listen(config.PORT, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });
})();
