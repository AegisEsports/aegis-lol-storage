/* eslint-disable no-restricted-properties */
import * as dotenv from 'dotenv';

dotenv.config();

const getEnv = (name: string): string => {
  if (!process.env[name]) {
    throw new Error(`environment variable ${name} not found`);
  }

  return process.env[name]!;
};

export default getEnv;
