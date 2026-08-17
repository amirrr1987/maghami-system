import { DataSource } from 'typeorm';

const DATABASE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const POSTGRES_RETRY_ATTEMPTS = 20;
const POSTGRES_RETRY_DELAY_MS = 1500;

/** Retries DNS / connection failures (common on Docker Desktop). */
export async function retryPostgres<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= POSTGRES_RETRY_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === POSTGRES_RETRY_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, POSTGRES_RETRY_DELAY_MS));
    }
  }
  throw lastError;
}

export type EnsurePostgresDatabaseOptions = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

/**
 * Connects to the default `postgres` DB and creates `database` when missing.
 * `CREATE DATABASE` cannot run against the target name, so this uses a
 * separate admin DataSource.
 */
export async function ensurePostgresDatabase(
  options: EnsurePostgresDatabaseOptions,
): Promise<void> {
  if (!DATABASE_NAME_PATTERN.test(options.database)) {
    throw new Error(
      `DATABASE_NAME must be a simple identifier, got "${options.database}"`,
    );
  }
  if (options.database === 'postgres') {
    return;
  }

  const admin = new DataSource({
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    database: 'postgres',
  });

  await admin.initialize();
  try {
    const rows: { exists: boolean }[] = await admin.query(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
      [options.database],
    );
    if (rows[0]?.exists) {
      return;
    }
    await admin.query(`CREATE DATABASE ${options.database}`);
  } finally {
    if (admin.isInitialized) {
      await admin.destroy();
    }
  }
}
