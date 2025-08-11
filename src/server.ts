import app from './app.js';
import { NODE_ENV, SERVER_PORT } from './config/env.js';
import { logger } from './util/logger.js';

app.listen(SERVER_PORT, () => {
  logger.info(`=================================`);
  logger.info(`======= ENV: ${NODE_ENV} =======`);
  logger.info(`🚀 App listening on the port ${SERVER_PORT}`);
  logger.info(`=================================`);
});
