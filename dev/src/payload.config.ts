import './dotenv'
import { buildConfig } from 'payload/config'
import path from 'path'
import Users from './collections/Users'
import Versions from './collections/Versions'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import Bases from './collections/Bases'
// @ts-ignore
import { withVersioning } from '../../src/plugin'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    disable: process.env.NODE_ENV === 'test',
    webpack: config => {
      const newConfig = {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config?.resolve?.alias || {}),
            react: path.join(__dirname, '../node_modules/react'),
            'react-dom': path.join(__dirname, '../node_modules/react-dom'),
            payload: path.join(__dirname, '../node_modules/payload'),
          },
        },
      }
      return newConfig
    },
  },
  editor: slateEditor({}),
  collections: [Users, Versions, Bases],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    withVersioning({
      enabled: true,
      relations: [
        {
          baseSlug: 'bases',
          versionSlug: 'versions',
        },
      ],
    }),
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    transactionOptions: false,
  }),
})
