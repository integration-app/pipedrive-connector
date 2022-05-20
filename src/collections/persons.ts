import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { UnifiedContactFields } from '@integration-app/sdk/udm/contacts'
import { Type } from '@sinclair/typebox'
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

const RECORD_KEY = 'persons'

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
    handler: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        ...request,
      }),
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
      owner_id: Type.String({
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
