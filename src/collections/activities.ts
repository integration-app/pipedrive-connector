import { Type } from '@sinclair/typebox'
import { makeActivityTypeSchema } from '../api/activity-types'
import { UnifiedActivityFields } from '@integration-app/sdk/udm/activities'
import { DataCollectionHandler } from '@integration-app/connector-sdk'
import {
  findInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import users from './users'
import {
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'

const OBJECT_PATH = 'activities'

const handler: DataCollectionHandler = {
  name: 'Activities',
  uri: '/data/collections/activities',
  fieldsSchema: getFieldsSchema,
  parseUnifiedFields: {
    activities: parseUnifiedFields,
  },
  extractUnifiedFields: {
    activities: extractUnifiedFields,
  },
  find: {
    handler: async (request) =>
      findInCollection({
        path: OBJECT_PATH,
        ...request,
      }),
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
      subscribeToCollection({ ...request, eventObject: 'activity' }),
    unsubscribeHandler: unsubscribeFromCollection,
    webhookHandler: handleSubscriptionWebhook,
  },
}

export default handler

async function getFieldsSchema({ apiClient }) {
  return Type.Partial(
    Type.Object({
      type: await makeActivityTypeSchema(apiClient),
      subject: Type.String(),
      note: Type.String(),
      public_description: Type.String(),
      done: Type.Boolean(),
      due_date: Type.String({
        format: 'date',
      }),
      due_time: Type.String({
        format: 'time',
      }),
      duration: Type.String({
        format: 'time',
      }),
      location: Type.String(),
      user_id: Type.String({
        title: 'User',
        referenceCollectionUri: users.uri,
      }),
      person_id: Type.Integer({
        referenceCollectionUri: 'data/collections/persons',
      }),
      org_id: Type.Integer({
        title: 'Organization',
        referenceCollectionUri: 'data/collections/organizations',
      }),
      deal_id: Type.Integer({
        title: 'Deal',
        referenceCollectionUri: 'data/collections/deals',
      }),
      lead_id: Type.Integer({
        title: 'Lead',
        referenceCollectionUri: 'data/collections/leads',
      }),
    }),
  )
}

function extractUnifiedFields({ fields }): UnifiedActivityFields {
  return {
    title: fields.subject,
    description: fields.note,
    dealId: fields.deal_id,
    leadId: fields.lead_id,
    contactId: fields.person_id,
    companyId: fields.org_id,
    userId: fields.user_id,
  }
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedActivity = unifiedFields as UnifiedActivityFields
  return {
    fields: {
      subject: unifiedActivity.title,
      note: unifiedActivity.description,
      deal_id: unifiedActivity.dealId,
      lead_id: unifiedActivity.leadId,
      person_id: unifiedActivity.contactId,
      org_id: unifiedActivity.companyId,
      user_id: unifiedActivity.userId,
    },
  }
}
