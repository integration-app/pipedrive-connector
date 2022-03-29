import dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer } from '@integration-app/connector-sdk'
import persons from './collections/persons'
import deals from './collections/deals'
import activities from './collections/activities'
import leads from './collections/leads'
import organizations from './collections/organizations'
import { ConnectionMode } from '@integration-app/sdk/connectors'
import users from './collections/users'
import rootDirectory from './collections/rootDirectory'

export const server = new ConnectorServer({
  baseUri: process.env.BASE_URI,
  connectionMode: ConnectionMode.IFRAME,
  name: 'Pipedrive',
  logoUri: 'public/logo.png',
  key: 'pipedrive',
  bucket: process.env.S3_BUCKET,
  tmpBucket: process.env.S3_TMP_BUCKET,
  secret: process.env.SECRET,
  data: {
    root: {
      uri: rootDirectory.uri,
    },
    'crm-leads': {
      uri: leads.uri,
    },
    'crm-contacts': {
      uri: persons.uri,
    },
    'crm-companies': {
      uri: organizations.uri,
    },
    'crm-deals': {
      uri: deals.uri,
    },
    'crm-activities': {
      uri: activities.uri,
    },
    users: {
      uri: users.uri,
    },
  } as any,
})

server.setupCredentialsForm({})

server.dataDirectory(rootDirectory)

server.dataCollection(organizations)
server.dataCollection(persons)
server.dataCollection(deals)
server.dataCollection(leads)
server.dataCollection(activities)
server.dataCollection(users)
