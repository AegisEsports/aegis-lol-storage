import { promises as fs } from 'fs';
import { Migrator, type Migration, type MigrationProvider } from 'kysely';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { db } from './database/database.js';
import { logger } from './util/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UrlAwareMigrationProvider implements MigrationProvider {
  constructor(private folder: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    // Read the folder as a normal filesystem path (Windows-safe)
    const entries = await fs.readdir(this.folder, { withFileTypes: true });

    // Allow TS/JS; keep it simple. Adjust if you only keep .ts in dev.
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((f) => /(\.ts|\.js|\.mjs|\.cjs)$/.test(f))
      .sort();

    const migrations: Record<string, Migration> = {};

    for (const file of files) {
      const fullPath = path.join(this.folder, file);

      // ESM-friendly import (Windows-safe): convert to file:// URL
      const mod = await import(pathToFileURL(fullPath).href);

      if (typeof mod.up !== 'function' || typeof mod.down !== 'function') {
        throw new Error(
          `Migration "${file}" is missing required exports: up/down.`,
        );
      }

      const name = file.replace(/\.[^.]+$/, ''); // strip extension
      migrations[name] = { up: mod.up, down: mod.down } satisfies Migration;
    }

    return migrations;
  }
}

const migrateToLatest = async () => {
  // keep this as a normal filesystem path
  const migrationsPath = path.join(__dirname, 'database', 'migrations');

  const migrator = new Migrator({
    db,
    provider: new UrlAwareMigrationProvider(migrationsPath),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      logger.info(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      logger.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    logger.error('failed to migrate');
    logger.error(error);
  }

  await db.destroy();
};

migrateToLatest();
