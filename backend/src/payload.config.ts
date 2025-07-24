// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Categories } from './collections/categories'
import { Carts } from './collections/Carts'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Products, Categories, Carts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],

  cors: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://192.168.1.13:3001',
    'http://192.168.1.13:3002',
    'http://localhost:3001/',
    'http://localhost:3002/',
    'http://localhost:3000/',
  ],
  csrf: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    'http://192.168.1.13:3001',
    'http://192.168.1.13:3002',
    'http://localhost:3001/',
    'http://localhost:3002/',
    'http://localhost:3000/',
  ],
})
