import { ConnectionConfig } from 'pg';
import { Config } from '../src/config';

export interface TestConfig extends Config {
  readonly adminDatabase: ConnectionConfig;
}

export const testConfig: TestConfig = {
  port: 3001,
  database: {
    host: 'localhost',
    database: 'aegis_lol_storage_test',
    user: 'postgres',
  },
  adminDatabase: {
    host: 'localhost',
    database: 'postgres',
    user: 'postgres',
  },
};
