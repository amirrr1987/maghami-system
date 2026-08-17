import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { DataSource } from 'typeorm';

const DATABASE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const POSTGRES_RETRY_ATTEMPTS = 20;
const POSTGRES_RETRY_DELAY_MS = 1500;
const POSTGRES_CONNECT_TIMEOUT_MS = 4000;

/** Retries DNS / connection failures (common on Docker Desktop). */
export async function retryPostgres<T>(
  operation: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= POSTGRES_RETRY_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Postgres attempt ${attempt}/${POSTGRES_RETRY_ATTEMPTS} failed: ${message}`,
      );
      if (attempt === POSTGRES_RETRY_ATTEMPTS) break;
      await new Promise((resolve) =>
        setTimeout(resolve, POSTGRES_RETRY_DELAY_MS),
      );
    }
  }
  throw lastError;
}

/** Force A-record lookup so Node does not hang on Docker AAAA / search domains. */
export async function resolvePostgresHost(host: string): Promise<string> {
  if (isIP(host)) return host;
  const { address } = await lookup(host, { family: 4 });
  return address;
}

export const postgresSocketOptions = {
  extra: { connectionTimeoutMillis: POSTGRES_CONNECT_TIMEOUT_MS },
};

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
    extra: postgresSocketOptions.extra,
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
