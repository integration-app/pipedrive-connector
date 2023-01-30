import {
  WebhookUnsubscribeArgs,
  HandleWebhookResponse,
  WebhookSubscribeArgs,
} from '@integration-app/connector-sdk'
import { BadRequestError } from '@integration-app/sdk/errors'
import {
  DataCollectionEvent,
  DataCollectionEventType,
} from '@integration-app/sdk/data-collections'
import { defaultExtractRecord } from './records'
import { getLatestRecordsArgs } from '@integration-app/connector-sdk/dist/handlers/data-collection'

export interface SubscriptionState {
  webhookId: string
}

export async function subscribeToCollection({
  apiClient,
  subscription,
  eventObject,
  connectorWebhookUri,
}: WebhookSubscribeArgs & {
  eventObject: string
}): Promise<SubscriptionState> {
  console.debug(
    `[Subscription ${subscription.id}] Subscribing to object ${eventObject} with webhook ${connectorWebhookUri}`,
  )
  const webhookResponse = await apiClient.post('webhooks', {
    subscription_url: connectorWebhookUri,
    event_action: '*',
    event_object: eventObject,
  })

  return {
    webhookId: webhookResponse.data.id,
  }
}

export async function unsubscribeFromCollection({
  apiClient,
  subscription,
  subscriptionState,
}: WebhookUnsubscribeArgs): Promise<void> {
  const state = subscriptionState as SubscriptionState
  console.debug(
    `[Subscription ${subscription.id}] Unsubscribing from webhook ${state.webhookId}`,
  )
  try {
    await apiClient.delete(`webhooks/${state.webhookId}`)
  } catch (err: any) {
    if (err?.data?.data?.errors?.[0] === 'not found') return
    throw err
  }
}

export async function handleSubscriptionWebhook({
  subscription,
  body = null,
  extractRecord,
}): Promise<HandleWebhookResponse> {
  const eventType = getDataCollectionEventType(body)

  const events = subscription.events

  console.debug(
    `Got an event of type ${eventType}. Subscribed to events: `,
    events,
  )

  switch (eventType) {
    case DataCollectionEventType.CREATED:
      if (!events.created) {
        return null
      }
      break
    case DataCollectionEventType.UPDATED:
      if (!events.updated) {
        return null
      }
      break
    case DataCollectionEventType.DELETED:
      if (!events.deleted) {
        return null
      }
      break
  }

  const event: DataCollectionEvent = {
    type: eventType,
    record:
      eventType === DataCollectionEventType.DELETED
        ? await extractRecord(body.previous)
        : await extractRecord(body.current),
  }

  return { events: [event] }
}

function getDataCollectionEventType(pipedriveEventBody) {
  switch (pipedriveEventBody.meta?.action) {
    case 'updated':
      return DataCollectionEventType.UPDATED
    case 'added':
      return DataCollectionEventType.CREATED
    case 'deleted':
      return DataCollectionEventType.DELETED
    case 'merged':
      return DataCollectionEventType.DELETED
    default:
      throw new BadRequestError(
        `Unknown event type: ${pipedriveEventBody.meta?.action}`,
      )
  }
}

const MAX_PULL_EVENTS = 1000

const EVENT_FIELD_MAPPING = {
  [DataCollectionEventType.CREATED]: 'add_time',
  [DataCollectionEventType.UPDATED]: 'update_time',
}

const DATE_FIELD_MAPPING = {
  [DataCollectionEventType.CREATED]: 'createdTime',
  [DataCollectionEventType.UPDATED]: 'updatedTime',
}

export async function getLatestRecords(
  { apiClient, limit, extractRecord, parameters }: getLatestRecordsArgs,
  path,
  activeOnly,
  event,
) {
  const recordDatetimeField = EVENT_FIELD_MAPPING[event]
  const eventDatetimeField = DATE_FIELD_MAPPING[event]
  const params = {
    sort: `${recordDatetimeField} DESC`,
    limit: limit ? limit : MAX_PULL_EVENTS,
    ...(parameters?.filter_id ? { filter_id: parameters.filter_id } : {}),
  }
  const response = await apiClient.get(path, params)

  let records = response.data ?? []
  if (activeOnly) {
    records = records.filter((record) => record.active_flag)
  }
  records = await Promise.all(
    records.map(extractRecord ?? defaultExtractRecord),
  )

  return {
    records: records.map((item) => ({
      ...item,
      [eventDatetimeField]: toDateTimeLiteral(item.fields[recordDatetimeField]),
    })),
  }
}

// converting pipedrive GMT datetime value to ISO 8601
function toDateTimeLiteral(datetime: string) {
  return new Date(datetime + ' GMT').toISOString()
}
