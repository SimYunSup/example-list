import path from 'path'

import { postgresAdapter as adapter } from '@payloadcms/db-postgres' // database-adapter-import
import { webpackBundler } from '@payloadcms/bundler-webpack' // bundler-import
import { lexicalEditor as editor } from '@payloadcms/richtext-lexical' // editor-import
import { buildConfig } from 'payload/config'

import { Users } from './collections/Users'
import { Nested } from './collections/Nested'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(), // bundler-config
  },
  editor: editor({}), // editor-config
  collections: [
    Users,
    Nested,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [],
  // database-adapter-config-start
  db: adapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    }
  }),
  // database-adapter-config-end
})
