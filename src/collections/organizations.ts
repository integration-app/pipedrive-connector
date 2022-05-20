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
  DataRecord,
  DataCollectionLookupResponse,
} from '@integration-app/sdk/connector-api'
import {
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'

const RECORD_KEY = 'organizations'

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
        recordKey: RECORD_KEY,
        ...request,
      }),
  },
  lookup: {
    fields: ['name'],
    handler: lookup,
  },
  create: {
    handler: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
  },
  update: {
    handler: async (request) =>
      updateCollectionRecord({
        recordKey: RECORD_KEY,
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

async function lookup({
  apiClient,
  fields = null,
}): Promise<DataCollectionLookupResponse> {
  if (fields.name) {
    const response = await apiClient.get('itemSearch', {
      fields: 'name',
      term: fields.name,
      exact_match: true,
      limit: 1,
    })
    return {
      record: parseRecord(response.data.items?.[0]?.item),
    }
  } else {
    return {
      record: null,
    }
  }
}

async function getFieldsSchema({}) {
  const type = Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: Type.String({
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
