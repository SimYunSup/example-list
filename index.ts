import type { DrizzleSnapshotJSON } from 'drizzle-kit/api'

import process from 'node:process';
import { createRequire } from 'node:module';
import path from 'node:path';
import url from 'node:url';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import {
  pgTable,
  jsonb,
  varchar,
  serial,
} from 'drizzle-orm/pg-core'

// Shim for drizzle-kit/payload
globalThis.require = createRequire(import.meta.url);
globalThis.__filename = url.fileURLToPath(import.meta.url);
globalThis.__dirname = path.dirname(__filename);

// If not dynamic import, Shim is not applied
const { generateDrizzleJson, generateMigration } = await import('drizzle-kit/api');

const test = pgTable(
  'tests',
  {
    id: serial('id').primaryKey(),
    text: (
      process.argv[2] === 'first'
        ? varchar('json')
        : jsonb('json').notNull()
    ),
  }
)
const schema = {
  tests: test,
};
type MigrationTemplateArgs = {
  downSQL?: string
  // imports?: string
  upSQL?: string
}


const migrationTemplate = ({
  downSQL,
  // imports,
  upSQL,
}: MigrationTemplateArgs): string => `
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
${upSQL}
};

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
${downSQL}
};
`

const getDefaultDrizzleSnapshot = (): DrizzleSnapshotJSON => ({
  id: '00000000-0000-0000-0000-000000000000',
  _meta: {
    columns: {},
    schemas: {},
    tables: {},
  },
  dialect: 'postgresql',
  enums: {},
  prevId: '00000000-0000-0000-0000-00000000000',
  schemas: {},
  tables: {},
  version: '7',
})


const drizzleJsonAfter = generateDrizzleJson(schema as any)
let drizzleJsonBefore = getDefaultDrizzleSnapshot()
let upSQL = '';
let downSQL = '';

const dir = path.resolve(import.meta.dirname, './migrations')

if (!upSQL) {
  // Get latest migration snapshot
  const latestSnapshotDir = await readdir(dir);
  const latestSnapshot = latestSnapshotDir
    .filter((file) => file.endsWith('.json'))
    .sort()
    .reverse()?.[0]

  if (latestSnapshot) {
    const fileInfo = await readFile(`${dir}/${latestSnapshot}`, 'utf8');
    drizzleJsonBefore = JSON.parse(
      fileInfo,
    ) as DrizzleSnapshotJSON
  }

  const sqlStatementsUp = await generateMigration(drizzleJsonBefore, drizzleJsonAfter)
  const sqlStatementsDown = await generateMigration(drizzleJsonAfter, drizzleJsonBefore)
  const sqlExecute = 'await payload.db.drizzle.execute(sql`'

  if (sqlStatementsUp?.length) {
    upSQL = `${sqlExecute}\n ${sqlStatementsUp?.join('\n')}\`)`
  }
  if (sqlStatementsDown?.length) {
    downSQL = `${sqlExecute}\n ${sqlStatementsDown?.join('\n')}\`)`
  }
}

const [yyymmdd, hhmmss] = new Date().toISOString().split('T')
const formattedDate = yyymmdd.replace(/\D/g, '')
const formattedTime = hhmmss.split('.')[0].replace(/\D/g, '')
const timestamp = `${formattedDate}_${formattedTime}`

const filePath = `${dir}/${timestamp}`
// write schema
await writeFile(`${filePath}.json`, JSON.stringify(drizzleJsonAfter, null, 2))

// write migration
await writeFile(
  `${filePath}.ts`,
  migrationTemplate({
    downSQL: downSQL || `  // Migration code`,
    upSQL: upSQL || `  // Migration code`,
  }),
)

