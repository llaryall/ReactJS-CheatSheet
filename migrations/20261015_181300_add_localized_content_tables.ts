import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const migrationName = '20261015_181300_add_localized_content_tables'

export const upSqlStatements = [
  `DO $$ BEGIN
    CREATE TYPE "_locales" AS ENUM ('en', 'fa');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$`,
  `CREATE TABLE IF NOT EXISTS "categories_locales" (
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "name" varchar NOT NULL,
    "description" varchar
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "categories_locales_locale_parent_id_unique"
    ON "categories_locales" ("_locale", "_parent_id")`,
  `CREATE TABLE IF NOT EXISTS "topics_locales" (
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL REFERENCES "topics"("id") ON DELETE CASCADE,
    "title" varchar NOT NULL,
    "summary" varchar,
    "mental_model" varchar,
    "golden_rule" varchar,
    "when_to_use" varchar,
    "when_not_to_use" varchar,
    "code_explanation" varchar,
    "description" jsonb
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "topics_locales_locale_parent_id_unique"
    ON "topics_locales" ("_locale", "_parent_id")`,
  `INSERT INTO "categories_locales" ("_locale", "_parent_id", "name")
    SELECT 'en', "id", "name" FROM "categories"
    ON CONFLICT ("_locale", "_parent_id") DO NOTHING`,
  `INSERT INTO "topics_locales" ("_locale", "_parent_id", "title", "description")
    SELECT 'en', "id", "title", "description" FROM "topics"
    ON CONFLICT ("_locale", "_parent_id") DO NOTHING`,
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const statement of upSqlStatements) {
    await db.execute(sql.raw(statement))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "topics_locales"`)
  await db.execute(sql`DROP TABLE IF EXISTS "categories_locales"`)
}
