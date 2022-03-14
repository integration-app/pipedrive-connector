import dotenv from 'dotenv'
dotenv.config()

import { ConnectorServer } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'
import {
  getFindOnePersonQuerySchema,
  getFindPersonsQuerySchema,
  getInsertPersonRecordSchema,
} from './collections/persons'
import {
  findInCollection,
  findOneInCollection,
  insertCollectionRecord,
  updateCollectionRecord,
} from './collections/common'
import {
  getDealsRecordSchema,
  getFindDealsQuerySchema,
  getFindOneDealQuerySchema,
} from './collections/deals'
import {
  getActivitiesRecordSchema,
  getFindActivitiesQuerySchema,
} from './collections/activities'
import {
  getFindLeadsQuerySchema,
  getFindOneLeadQuerySchema,
  getInsertLeadRecordSchema,
} from './collections/leads'
import {
  getFindOneOrganizationQuerySchema,
  getFindOrganizationsQuerySchema,
  getOrganizationsRecordSchema,
} from './collections/organizations'
import { ConnectionMode } from '@integration-app/sdk/connectors'
import { UnifiedContactRecord } from '@integration-app/sdk/udm/crm-contacts'

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

const collections = [
  {
    name: 'Leads',
    key: 'leads',
    findQuerySchema: getFindLeadsQuerySchema,
    findOneQuerySchema: getFindOneLeadQuerySchema,
    recordSchema: getInsertLeadRecordSchema,
  },
  {
    name: 'Persons',
    key: 'persons',
    searchItemType: 'person',
    findQuerySchema: getFindPersonsQuerySchema,
    findOneQuerySchema: getFindOnePersonQuerySchema,
    recordSchema: getInsertPersonRecordSchema,
    parseUnifiedQuery: (unifiedQuery: any) => {
      if (unifiedQuery?.['crm-contacts']) {
        if (unifiedQuery['crm-contacts'].email) {
          return {
            search: {
              fields: ['email'],
              term: unifiedQuery['crm-contacts'].email,
            },
          }
        }
      }
      return null
    },
    parseUnifiedRecord: (unifiedRecord: any) => {
      if (unifiedRecord?.['crm-contacts']) {
        const unifiedContact: UnifiedContactRecord =
          unifiedRecord['crm-contacts']
        return {
          name: `${unifiedContact.firstName} ${unifiedContact.lastName}`,
          email: unifiedRecord.email,
        }
      } else {
        return null
      }
    },
  },
  {
    name: 'Organizations',
    key: 'organizations',
    searchItemType: 'organization',
    findQuerySchema: getFindOrganizationsQuerySchema,
    findOneQuerySchema: getFindOneOrganizationQuerySchema,
    recordSchema: getOrganizationsRecordSchema,
  },
  {
    name: 'Deals',
    key: 'deals',
    searchItemType: 'deal',
    findQuerySchema: getFindDealsQuerySchema,
    findOneQuerySchema: getFindOneDealQuerySchema,
    recordSchema: getDealsRecordSchema,
  },
  {
    name: 'Activities',
    key: 'activities',
    findQuerySchema: getFindActivitiesQuerySchema,
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
    find: {
      querySchema: collection.findQuerySchema,
      execute: (request) =>
        findInCollection(
          collection,
          request.credentials,
          request.query ??
            collection?.parseUnifiedQuery?.(request.unifiedQuery),
          request.cursor,
        ),
    },
    findOne: collection.findOneQuerySchema
      ? {
          querySchema: collection.findOneQuerySchema,
          execute: (request) =>
            findOneInCollection(
              collection,
              request.credentials,
              request.query ??
                collection.parseUnifiedQuery?.(request.unifiedQuery),
            ),
        }
      : undefined,
    create: {
      execute: async (request) =>
        insertCollectionRecord(
          collection,
          request.credentials,
          request.record ??
            collection.parseUnifiedRecord?.(request.unifiedRecord),
        ),
      recordSchema: collection.recordSchema,
    },
    update: {
      execute: async (request) =>
        updateCollectionRecord(
          collection,
          request.credentials,
          request.id,
          request.record ??
            collection.parseUnifiedRecord?.(request.unifiedRecord),
        ),
      recordSchema: collection.recordSchema,
    },
  })
})
