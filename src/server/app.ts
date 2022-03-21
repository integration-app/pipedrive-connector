import dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'
import persons from './collections/persons'
import deals from './collections/deals'
import activities from './collections/activities'
import leads from './collections/leads'
import organizations from './collections/organizations'
import { ConnectionMode } from '@integration-app/sdk/connectors'
import { toHeaderCase } from 'js-convert-case'

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
      uri: 'data/root',
    },
    'crm-leads': {
      uri: 'data/collections/leads',
    },
    'crm-contacts': {
      uri: 'data/collections/persons',
    },
    'crm-companies': {
      uri: 'data/collections/organizations',
    },
    'crm-deals': {
      uri: 'data/collections/deals',
    },
    'crm-activities': {
      uri: 'data/collections/activities',
    },
  } as any,
})

server.setupCredentialsForm({})

server.dataDirectory('data/root', {
  name: 'All Data',
  list: {
    execute: async () => {
      const collections = [
        'organizations',
        'persons',
        'deals',
        'leads',
        'activities',
      ]
      const locations = collections.map((collection) => ({
        type: DataLocationType.collection,
        uri: `data/collections/${collection}`,
        name: toHeaderCase(collection),
      }))
      return { locations }
    },
  },
})

server.dataCollection('data/collections/organizations', organizations)
server.dataCollection('data/collections/persons', persons)
server.dataCollection('data/collections/deals', deals)
server.dataCollection('data/collections/leads', leads)
server.dataCollection('data/collections/activities', activities)
