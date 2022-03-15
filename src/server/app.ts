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
import {
  UnifiedContactFindQuery,
  UnifiedContactRecord,
} from '@integration-app/sdk/udm/crm-contacts'
import { UnifiedActivityRecord } from '@integration-app/sdk/udm/crm-activities'

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
    parseUnifiedQuery: async ({ udmKey, unifiedQuery }) => {
      if (udmKey === 'crm-contacts') {
        const contactsQuery = unifiedQuery as UnifiedContactFindQuery
        if (contactsQuery.email) {
          return {
            query: {
              search: {
                fields: ['email'],
                term: contactsQuery.email,
              },
            },
          }
        }
      }
      return null
    },
    parseUnifiedRecord: async ({ udmKey, unifiedRecord }) => {
      if (udmKey === 'crm-contacts') {
        const unifiedContact: UnifiedContactRecord =
          unifiedRecord['crm-contacts']
        return {
          record: {
            name: `${unifiedContact.firstName} ${unifiedContact.lastName}`,
            email: unifiedRecord.email,
            // ToDo: the rest of fields
          },
        }
      }
      return null
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
    parseUnifiedRecord: async ({ udmKey, unifiedRecord }) => {
      if (udmKey === 'crm-activities') {
        const unifiedActivity = unifiedRecord as UnifiedActivityRecord
        return {
          record: {
            subject: unifiedActivity.title,
            note: unifiedActivity.description,
            deal_id: unifiedActivity.dealId,
            lead_id: unifiedActivity.leadId,
            person_id: unifiedActivity.contactId,
            org_id: unifiedActivity.companyId,
            // ToDo: other fields
          },
        }
      } else {
        return null
      }
    },
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
          request.query,
          request.cursor,
        ),
      parseUnifiedQuery: collection.parseUnifiedQuery,
    },
    findOne: collection.findOneQuerySchema
      ? {
          querySchema: collection.findOneQuerySchema,
          execute: (request) =>
            findOneInCollection(collection, request.credentials, request.query),
          parseUnifiedQuery: collection.parseUnifiedQuery,
        }
      : undefined,
    create: {
      execute: async (request) =>
        insertCollectionRecord(collection, request.credentials, request.record),
      recordSchema: collection.recordSchema,
      parseUnifiedRecord: collection.parseUnifiedRecord,
    },
    update: {
      execute: async (request) =>
        updateCollectionRecord(
          collection,
          request.credentials,
          request.id,
          request.record,
        ),
      recordSchema: collection.recordSchema,
      parseUnifiedRecord: collection.parseUnifiedRecord,
    },
  })
})
