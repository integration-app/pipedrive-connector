import * as dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer, RestApiClient } from '@integration-app/connector-sdk'
import persons from './collections/persons'
import deals from './collections/deals'
import activities from './collections/activities'
import leads from './collections/leads'
import organizations from './collections/organizations'
import { ConnectionMode } from '@integration-app/sdk/connectors'
import users from './collections/users'
import rootDirectory from './collections/rootDirectory'
import { testConnection } from './api'

export const server = new ConnectorServer({
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
      uri: rootDirectory.uri,
    },
    leads: {
      uri: leads.uri,
    },
    contacts: {
      uri: persons.uri,
    },
    companies: {
      uri: organizations.uri,
    },
    deals: {
      uri: deals.uri,
    },
    activities: {
      uri: activities.uri,
    },
    users: {
      uri: users.uri,
    },
  } as any,
})

server.dataDirectory(rootDirectory)

server.dataCollection(organizations)
server.dataCollection(persons)
server.dataCollection(deals)
server.dataCollection(leads)
server.dataCollection(activities)
server.dataCollection(users)
