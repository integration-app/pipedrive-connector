import * as dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer, RestApiClient } from '@integration-app/connector-sdk'
import { ConnectionMode } from '@integration-app/sdk/integrations'
import { testConnection } from './api'

export const server = new ConnectorServer({
  rootDir: __dirname,
  baseUri: process.env.BASE_URI,
  connectionMode: ConnectionMode.IFRAME,
  name: 'Pipedrive',
  logoUri: 'public/logo.png',
  key: 'pipedrive',
  bucket: process.env.S3_BUCKET,
  tmpBucket: process.env.S3_TMP_BUCKET,
  secret: process.env.SECRET,
  ui: {
    description: 'Enter your Pipedrive API token into the field below.',
    schema: {
      type: 'object',
      properties: {
        api_token: {
          type: 'string',
          title: 'Pipedrive API Token',
        },
      },
    },
    helpUri:
      'https://support.pipedrive.com/en/article/how-can-i-find-my-personal-api-key',
    testHandler: ({ connectionParameters }) =>
      testConnection(connectionParameters.api_token),
  },
  makeApiClient: ({ credentials }) => {
    return new RestApiClient({
      baseUri: 'https://api.pipedrive.com/v1',
      query: {
        api_token: credentials.api_token,
      },
    })
  },
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
    users: {
      path: '/data/users',
    },
  },
})
