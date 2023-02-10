import * as dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer } from '@integration-app/connector-sdk'

export const server = new ConnectorServer({
  rootDir: __dirname,
  baseUri: process.env.BASE_URI,
  key: 'pipedrive',
  bucket: process.env.S3_BUCKET,
  tmpBucket: process.env.S3_TMP_BUCKET,
  secret: process.env.SECRET,
  data: {
    root: {
      path: '/data/root',
    },
    contacts: {
      path: '/data/persons-dir',
    },
    companies: {
      path: '/data/organizations-dir',
    },
    deals: {
      path: '/data/deals-dir',
    },
    products: {
      path: '/data/products',
    },
    activities: {
      path: '/data/activities-dir',
    },
    notes: {
      path: '/data/notes',
    },
    users: {
      path: '/data/users',
    },
  },
})
