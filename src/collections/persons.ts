import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { DataRecord } from '@integration-app/sdk/connector-api'
import { UnifiedContactFields } from '@integration-app/sdk/udm/contacts'
import { Type } from '@sinclair/typebox'
import { lookupRecords } from '../api/records'
import {
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'
import { makeVisibleToSchema } from '../api/visibility'
import {
  findInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import users from './users'

const OBJECT_PATH = 'persons'
const LOOKUP_FIELDS = ['email', 'name', 'phone']

const handler: DataCollectionHandler = {
  name: 'Persons',
  uri: '/data/collections/persons',
  fieldsSchema: getFieldsSchema,
  parseUnifiedFields: {
    contacts: parseUnifiedFields,
  },
  extractUnifiedFields: {
    contacts: extractUnifiedFields,
  },
  find: {
    handler: async (request) => {
      const response = await findInCollection({
        path: OBJECT_PATH,
        ...request,
      })
      return {
        ...response,
        records: response.records.map(processRecord),
      }
    },
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
      subscribeToCollection({ ...request, eventObject: 'person' }),
    unsubscribeHandler: unsubscribeFromCollection,
    webhookHandler: handleSubscriptionWebhook,
  },
}

export default handler

async function getFieldsSchema() {
  return Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: Type.Number({
        title: 'Owner',
        referenceCollectionUri: users.uri,
      }),
      org_id: Type.Integer({
        title: 'Organization',
        referenceCollectionUri: 'data/collections/organizations',
      }),
      email: Type.Array(Type.String(), { title: 'Email(s)' }),
      phone: Type.Array(Type.String(), { title: 'Phone(s)' }),
      visible_to: await makeVisibleToSchema(),
      marketing_status: Type.String({
        title: 'Marketing Status',
        enum: ['no_consent', 'unsubscribed', 'subscribed', 'archived'],
      }),
    }),
  )
}

function processRecord(record: DataRecord) {
  // Bring the structure to fieldSchema we use in other operations.
  const fields = {
    ...record.fields,
    org_id: record.fields.org_id?.value,
    owner_id: record.fields.owner_id?.id,
    phone: record.fields.phone?.map((phone) => phone.value),
    email: record.fields.email?.map((email) => email.value),
  }
  return {
    ...record,
    fields,
  }
}

function extractUnifiedFields({ fields }): UnifiedContactFields {
  return {
    name: fields.name,
    email: fields.email?.[0]?.value,
    companyId: fields.org_id,
    companyName: fields.org_name,
    userId: fields.owner_id?.id,
  }
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedContact: UnifiedContactFields = unifiedFields
  return {
    fields: {
      name: unifiedContact.name,
      email: [
        {
          value: unifiedFields.email,
        },
      ],
      org_id: unifiedContact.companyId,
      owner_id: unifiedContact.userId,
    },
  }
}
