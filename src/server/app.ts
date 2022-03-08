import dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer } from '@integration-app/connector-sdk'
import {
  ConnectionMode,
  DataLocationType,
} from '@integration-app/sdk/connector-api'
import {
  getInsertPersonRecordSchema,
  getPersonsQuerySchema,
} from './collections/persons'
import {
  insertCollectionRecord,
  queryCollection,
  updateCollectionRecord,
  upsertCollectionRecord,
} from './collections/common'
import { getDealsQuerySchema, getDealsRecordSchema } from './collections/deals'
import {
  getActivitiesQuerySchema,
  getActivitiesRecordSchema,
} from './collections/activities'
import {
  getInsertLeadRecordSchema,
  getLeadsQuerySchema,
} from './collections/leads'
import {
  getOrganizationsQuerySchema,
  getOrganizationsRecordSchema,
} from './collections/organizations'

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
    crm: {
      leads: {
        uri: 'data/collections/leads',
      },
      contacts: {
        uri: 'data/collections/persons',
      },
      companies: {
        uri: 'data/collections/organizations',
      },
      deals: {
        uri: 'data/collections/deals',
      },
      activities: {
        uri: 'data/collections/activities',
      },
    },
  } as any,
})

server.setupCredentialsForm({})

const collections = [
  {
    name: 'Leads',
    key: 'leads',
    querySchema: getLeadsQuerySchema,
    recordSchema: getInsertLeadRecordSchema,
  },
  {
    name: 'Persons',
    key: 'persons',
    searchItemType: 'person',
    querySchema: getPersonsQuerySchema,
    recordSchema: getInsertPersonRecordSchema,
  },
  {
    name: 'Organizations',
    key: 'organizations',
    searchItemType: 'organization',
    querySchema: getOrganizationsQuerySchema,
    recordSchema: getOrganizationsRecordSchema,
  },
  {
    name: 'Deals',
    key: 'deals',
    searchItemType: 'deal',
    querySchema: getDealsQuerySchema,
    recordSchema: getDealsRecordSchema,
  },
  {
    name: 'Activities',
    key: 'activities',
    querySchema: getActivitiesQuerySchema,
    recordSchema: getActivitiesRecordSchema,
  },
]

server.dataDirectory('data/root', {
  name: 'All Data',
  list: {
    execute: async () => {
      const locations = collections.map((collection) => ({
        type: DataLocationType.collection,
        uri: `data/collections/${collection.key}`,
        name: collection.name,
      }))
      return { locations }
    },
  },
})

collections.forEach((collection) => {
  server.dataCollection(`data/collections/${collection.key}`, {
    name: collection.name,
    query: {
      querySchema: collection.querySchema,
      execute: (request) => queryCollection(collection, request),
    },
    insert: {
      execute: async (request) => insertCollectionRecord(collection, request),
      recordSchema: collection.recordSchema,
    },
    update: {
      execute: async (request) => updateCollectionRecord(collection, request),
      recordSchema: collection.recordSchema,
      querySchema: collection.querySchema,
    },
    upsert: {
      querySchema: collection.querySchema,
      recordSchema: collection.recordSchema,
      execute: async (request) => upsertCollectionRecord(collection, request),
    },
  })
})
