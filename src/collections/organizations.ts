import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makeVisibleToSchema } from '../api/visibility'
import {
  createCollectionRecord,
  findInCollection,
  updateCollectionRecord,
} from './common'
import { UnifiedCompanyFields } from '@integration-app/sdk/udm/companies'
import users from './users'
import {
  DataCollectionFindResponse,
  DataRecord,
} from '@integration-app/sdk/connector-api'
import {
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'
import { lookupRecords } from '../api/records'

const OBJECT_PATH = 'organizations'

const LOOKUP_FIELDS = ['name']

const handler: DataCollectionHandler = {
  name: 'Organizations',
  uri: '/data/collections/organizations',
  fieldsSchema: getFieldsSchema,
  parseUnifiedFields: {
    companies: parseUnifiedFields,
  },
  extractUnifiedFields: {
    companies: extractUnifiedFields,
  },
  find: {
    handler: (request) =>
      findInCollection({
        path: OBJECT_PATH,
        ...request,
      }),
  },
  lookup: {
    fields: LOOKUP_FIELDS,
    handler: async (request) =>
      lookupRecords({ ...request, path: OBJECT_PATH }),
  },
  create: {
    handler: async (request) =>
      createCollectionRecord({ path: OBJECT_PATH, ...request }),
  },
  update: {
    handler: async (request) =>
      updateCollectionRecord({
        path: OBJECT_PATH,
        ...request,
      }),
  },
  events: {
    subscribeHandler: (request) =>
      subscribeToCollection({ ...request, eventObject: 'organization' }),
    unsubscribeHandler: unsubscribeFromCollection,
    webhookHandler: handleSubscriptionWebhook,
  },
}

export default handler

function parseRecord(record): DataRecord {
  return record
    ? {
        id: record.id,
        name: record.name,
        fields: record,
      }
    : null
}

export async function searchRecord({
  apiClient,
  field,
  term,
}): Promise<DataCollectionFindResponse> {
  const response = await apiClient.get('itemSearch', {
    fields: field,
    term: term,
    exact_match: true,
    limit: 1,
  })
  return {
    records: response.data.items.map(parseRecord),
  }
}

async function getFieldsSchema({}) {
  const type = Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: Type.Number({
        title: 'Owner',
        referenceCollectionUri: users.uri,
      }),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['name']
  return type
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedCompany: UnifiedCompanyFields = unifiedFields
  return {
    fields: {
      name: unifiedCompany.name,
      owner_id: unifiedCompany.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    name: fields.name,
    userId: fields.owner_id?.id,
  }
}
