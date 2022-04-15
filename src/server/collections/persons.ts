import {
  DataCollectionHandler,
  ConnectorDataCollectionSubscribeRequest,
  ConnectorDataCollectionUnsubscribeRequest,
  ConnectorSubscriptionWebhookRequest,
} from '@integration-app/connector-sdk'
import {
  UnifiedContactQuery,
  UnifiedContactFields,
} from '@integration-app/sdk/udm/crm-contacts'
import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeVisibleToSchema } from '../api/visibility'
import {
  findInCollection,
  findOneInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import users from './users'
import {
  DataCollectionSubscribeResponse,
  DataCollectionSubscriptionMode,
  DataCollectionUnsubscribeResponse,
  DataEvent,
  DataEventType,
} from '@integration-app/sdk/connector-api'
import { defaultParseRecord } from '../api/records'
import { BadRequestError } from '@integration-app/sdk/errors'
import axios from 'axios'

const RECORD_KEY = 'persons'
const SEARCH_ITEM_TYPE = 'person'
const SEARCH_FIELDS = ['custom_fields', 'email', 'name', 'notes', 'phone']

const handler: DataCollectionHandler = {
  name: 'Persons',
  uri: '/data/collections/persons',
  find: {
    querySchema: getFindQuerySchema,
    execute: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        searchItemType: SEARCH_ITEM_TYPE,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-contacts': parseFindUnifiedQuery,
    },
    extractUnifiedFields: {
      'crm-contacts': extractUnifiedFields,
    },
  },
  findOne: {
    querySchema: getFindOneQuerySchema,
    execute: (request) =>
      findOneInCollection({
        searchItemType: SEARCH_ITEM_TYPE,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-contacts': parseFindOneUnifiedQuery,
    },
    extractUnifiedFields: {
      'crm-contacts': extractUnifiedFields,
    },
  },
  create: {
    execute: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
    fieldsSchema: getCreateFieldsSchema,
    parseUnifiedFields: {
      'crm-contacts': parseUnifiedFields,
    },
  },
  update: {
    execute: async (request) =>
      updateCollectionRecord({
        recordKey: RECORD_KEY,
        ...request,
      }),
    fieldsSchema: getUpdateFieldsSchema,
    parseUnifiedFields: {
      'crm-contacts': parseUnifiedFields,
    },
  },
  subscribe: subscribeToCollection,
  unsubscribe: unsubscribeFromCollection,
  handleSubscriptionWebhook,
}

export default handler

async function getFindQuerySchema({ apiClient }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(apiClient, 'people'),
    Type.String({
      title: 'Owner',
      referenceCollectionUri: users.uri,
    }),
  ])
}

function getFindOneQuerySchema({}) {
  return makeSearchQuerySchema(SEARCH_FIELDS)
}

async function getCreateFieldsSchema({}) {
  const schema = await getCommonFieldsSchema()
  schema.required = ['name']
  return schema
}

async function getUpdateFieldsSchema() {
  return getCommonFieldsSchema()
}

async function getCommonFieldsSchema() {
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

async function parseFindOneUnifiedQuery({ unifiedQuery }) {
  const contactsQuery = unifiedQuery as UnifiedContactQuery
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
  return null
}

async function parseFindUnifiedQuery({ unifiedQuery }) {
  const contactsQuery = unifiedQuery as UnifiedContactQuery
  if (contactsQuery.email) {
    return {
      query: {
        $anyOfOption: {
          index: 0,
          value: {
            search: {
              fields: ['email'],
              term: contactsQuery.email,
            },
          },
        },
      },
    }
  }
  return null
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
      email: [unifiedFields.email],
      org_id: unifiedContact.companyId,
      owner_id: unifiedContact.userId,
    },
  }
}

async function subscribeToCollection({
  apiClient,
  subscriptionManager,
  callbackUri,
  events,
}: ConnectorDataCollectionSubscribeRequest): Promise<DataCollectionSubscribeResponse> {
  if (!callbackUri) {
    throw new BadRequestError(
      'Callback URI is required to subscribe to this collection',
    )
  }
  const subscription = await subscriptionManager.createSubscription({
    callbackUri,
    events,
  })
  const webhookResponse = await apiClient.post('webhooks', {
    subscription_url: subscription.webhookUri,
    event_action: '*',
    event_object: 'person',
  })
  subscription.data.webhookId = webhookResponse.data.id
  await subscriptionManager.saveSubscription(subscription)
  return {
    subscriptionId: subscription.id,
    mode: DataCollectionSubscriptionMode.PUSH,
  }
}

async function unsubscribeFromCollection({
  apiClient,
  subscriptionId,
  subscriptionManager,
}: ConnectorDataCollectionUnsubscribeRequest): Promise<DataCollectionUnsubscribeResponse> {
  const subscription = await subscriptionManager.getSubscription(subscriptionId)
  console.log('Unsubscribing from subscription', subscription)
  await apiClient.delete(`webhooks/${subscription.data.webhookId}`)
  return {}
}

async function handleSubscriptionWebhook({
  apiClient,
  subscriptionManager,
  subscription,
  credentials,
  parameters,
  body,
}: ConnectorSubscriptionWebhookRequest) {
  const eventType = getDataEventType(body)

  const event: DataEvent = {
    type: eventType,
    record:
      eventType === DataEventType.DELETED
        ? defaultParseRecord(body.previous)
        : defaultParseRecord(body.current),
  }

  const callbackUri = subscription.data.callbackUri

  try {
    await axios.post(callbackUri, {
      subscriptionId: subscription.id,
      events: [event],
    })
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Trigger callback is not recognized - let's disable the subscription
      await unsubscribeFromCollection({
        apiClient,
        subscriptionId: subscription.id,
        subscriptionManager,
        credentials,
        parameters,
      })
      await subscriptionManager.deleteSubscription(subscription.id)
    } else {
      throw error
    }
  }
}

function getDataEventType(pipedriveEventBody) {
  switch (pipedriveEventBody.meta?.action) {
    case 'updated':
      return DataEventType.UPDATED
    case 'added':
      return DataEventType.CREATED
    case 'deleted':
      return DataEventType.DELETED
    case 'merged':
      return DataEventType.DELETED
    default:
      throw new BadRequestError(
        `Unknown event type: ${pipedriveEventBody.meta?.action}`,
      )
  }
}
