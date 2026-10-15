import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Categories } from './collections/Categories'
import { Topics } from './collections/Topics'
import { DecisionTrees } from './collections/DecisionTrees'
import { CodeComparisons } from './collections/CodeComparisons'
import { Quizzes } from './collections/Quizzes'
import { Sources } from './collections/Sources'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-this',
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'fa', label: 'Persian (فارسی)', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Categories,
    Topics,
    DecisionTrees,
    CodeComparisons,
    Quizzes,
    Sources,
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  typescript: {
    outputFile: './payload-types.ts',
  },
  admin: {
    meta: {
      titleSuffix: ' - React Cheat Sheet',
      description: 'Admin panel for ReactJS Cheat Sheet',
    },
  },
})
