import { DataSource } from 'typeorm';
import type { EnsurePostgresDatabaseOptions } from './ensure-postgres-database';

/**
 * Repair legacy permissions rows before TypeORM synchronize:
 * backfill resource/action from old `code`, drop `code`, dedupe (resource, action).
 */
export async function repairPermissionsCatalogBeforeSync(
  options: EnsurePostgresDatabaseOptions,
): Promise<void> {
  const ds = new DataSource({
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    database: options.database,
  });

  await ds.initialize();
  try {
    const tables: { exists: boolean }[] = await ds.query(
      `SELECT to_regclass('public.permissions') IS NOT NULL AS exists`,
    );
    if (!tables[0]?.exists) {
      return;
    }

    await ds.query(`
      DO $repair$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'permissions'
            AND column_name = 'resource'
            AND udt_name = 'permission_resource'
        ) THEN
          ALTER TABLE permissions
            ALTER COLUMN resource TYPE varchar(64) USING resource::text;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'permissions'
            AND column_name = 'action'
            AND udt_name = 'permission_action'
        ) THEN
          ALTER TABLE permissions
            ALTER COLUMN action TYPE varchar(64) USING action::text;
        END IF;
      END
      $repair$;
    `);

    await ds.query(`DROP TYPE IF EXISTS permission_resource`);
    await ds.query(`DROP TYPE IF EXISTS permission_action`);

    const hasCode: { exists: boolean }[] = await ds.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'permissions'
          AND column_name = 'code'
      ) AS exists
    `);

    if (hasCode[0]?.exists) {
      await ds.query(`
        UPDATE permissions
        SET
          resource = lower(split_part(code, ':', 1)),
          action = lower(split_part(code, ':', 2))
        WHERE position(':' IN code) > 1
          AND (
            resource IS NULL
            OR btrim(resource::text) = ''
            OR action IS NULL
            OR btrim(action::text) = ''
          )
      `);
    }

    const invalidFilter = `
      resource IS NULL
      OR btrim(resource::text) = ''
      OR action IS NULL
      OR btrim(action::text) = ''
      OR action = 'full'
      OR action = 'write'
    `;

    const roleLinks: { exists: boolean }[] = await ds.query(
      `SELECT to_regclass('public.role_permissions') IS NOT NULL AS exists`,
    );

    const dupIdsSql = `
      SELECT dup.id
      FROM permissions dup
      INNER JOIN permissions keep
        ON keep.resource = dup.resource
       AND keep.action = dup.action
       AND keep.id < dup.id
    `;

    if (roleLinks[0]?.exists) {
      await ds.query(`
        DELETE FROM role_permissions
        WHERE permission_id IN (
          SELECT id FROM permissions WHERE ${invalidFilter}
        )
           OR permission_id IN (${dupIdsSql})
      `);
    }

    await ds.query(`DELETE FROM permissions WHERE ${invalidFilter}`);
    await ds.query(`
      DELETE FROM permissions dup
      USING permissions keep
      WHERE keep.resource = dup.resource
        AND keep.action = dup.action
        AND keep.id < dup.id
    `);

    if (hasCode[0]?.exists) {
      await ds.query(`ALTER TABLE permissions DROP COLUMN IF EXISTS code`);
    }
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
}
