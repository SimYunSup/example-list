import path from 'path'

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload/config'

import { Users } from './collections/Users'
import { RichText } from './collections/RichText'
import { AdobeProvider } from './components/adobe'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: lexicalEditor({}),
  collections: [
    Users,
    RichText,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  i18n: {
    resources: {
      en: {
        table: {
          backgroundColor: 'Background Color',
          row: 'Row',
          column: 'Column',
          rows: 'Rows',
          columns: 'Columns',
          add: 'Add',
          header: 'Header',
          remove: 'Remove',
          delete: 'Delete',
          table: 'Table',
          insertRight: 'Insert {{target}} Right',
          insertLeft: 'Insert {{target}} Left',
          insertBelow: 'Insert {{target}} Below',
          insertAbove: 'Insert {{target}} Above',
          mergeCell: 'Merge Cells',
          unmergeCell: 'Unmerge Cell',
        }
      }
    }
  }
})
