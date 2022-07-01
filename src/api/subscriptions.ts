import {
  ConnectorDataCollectionSubscribeRequest,
  ConnectorDataCollectionUnsubscribeRequest,
  ConnectorSubscriptionWebhookRequest,
  ConnectorDataCollectionUpdateSubscriptionRequest,
  fullScanEvents,
  fullScanSubscribe,
} from '@integration-app/connector-sdk'
import {
  DataCollectionEventsResponse,
  DataCollectionSubscribeResponse,
  DataCollectionUnsubscribeResponse,
} from '@integration-app/sdk/connector-api'
import { BadRequestError } from '@integration-app/sdk/errors'
import { defaultExtractRecord } from './records'
import axios from 'axios'
import { ConnectorDataCollectionEventsRequest } from '@integration-app/connector-sdk'
import {
  DataCollectionEvent,
  DataCollectionEventType,
} from '@integration-app/sdk/data-collections'

const FULL_SCAN_INTERVAL = 12 * 3600 * 1000 // 12 hours

export async function subscribeToCollection({
  apiClient,
  subscriptionManager,
  callbackUri,
  events,
  eventObject,
}: ConnectorDataCollectionSubscribeRequest & {
  eventObject: string
}): Promise<DataCollectionSubscribeResponse> {
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
    event_object: eventObject,
  })
  subscription.data.webhookId = webhookResponse.data.id
  await subscriptionManager.saveSubscription(subscription)
  return {
    subscriptionId: subscription.id,
  }
}

export async function updateSubscription({
  subscriptionManager,
  subscriptionId,
  callbackUri,
  events,
}: ConnectorDataCollectionUpdateSubscriptionRequest) {
  console.debug(`Updating subscription ${subscriptionId} to`, events)
  const subscription = await subscriptionManager.getSubscription(subscriptionId)
  subscription.data = {
    ...subscription.data,
    callbackUri,
    events,
  }
  await subscriptionManager.saveSubscription(subscription)
  return {}
}

export async function unsubscribeFromCollection({
  apiClient,
  subscriptionId,
  subscriptionManager,
}: ConnectorDataCollectionUnsubscribeRequest): Promise<DataCollectionUnsubscribeResponse> {
  const subscription = await subscriptionManager.getSubscription(subscriptionId)
  console.debug('Unsubscribing from subscription', subscription)
  await apiClient.delete(`webhooks/${subscription.data.webhookId}`)
  return {}
}

export async function handleSubscriptionWebhook({
  subscription,
  body,
}: ConnectorSubscriptionWebhookRequest) {
  const eventType = getDataCollectionEventType(body)

  const events = subscription.data.events

  console.debug(
    `Got an event of type ${eventType}. Subscribed to events: `,
    events,
  )

  switch (eventType) {
    case DataCollectionEventType.CREATED:
      if (!events.created) {
        return
      }
      break
    case DataCollectionEventType.UPDATED:
      if (!events.updated) {
        return
      }
      break
    case DataCollectionEventType.DELETED:
      if (!events.deleted) {
        return
      }
      break
  }

  console.debug('Sending event to callbackUri')

  const event: DataCollectionEvent = {
    type: eventType,
    record:
      eventType === DataCollectionEventType.DELETED
        ? await defaultExtractRecord(body.previous)
        : await defaultExtractRecord(body.current),
  }

  const callbackUri = subscription.data.callbackUri

  await axios.post(callbackUri, {
    subscriptionId: subscription.id,
    events: [event],
  })
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

export async function fullScanSubscribeHandler({
  credentials,
  apiClient,
  subscriptionManager,
  events,
  parameters,
  storage,
  findHandler,
}: ConnectorDataCollectionSubscribeRequest & {
  findHandler: any
}): Promise<DataCollectionSubscribeResponse> {
  const subscription = await subscriptionManager.createSubscription({
    events,
  })

  const cursor = await fullScanSubscribe(
    findHandler,
    {
      apiClient,
      credentials,
      parameters,
    },
    storage,
  )

  return {
    subscriptionId: subscription.id,
    pullIntervalSeconds: FULL_SCAN_INTERVAL,
    cursor,
  }
}

export async function fullScanEventsHandler({
  apiClient,
  credentials,
  parameters,
  cursor,
  subscriptionManager,
  subscriptionId,
  storage,
  findHandler,
}: ConnectorDataCollectionEventsRequest & {
  findHandler: any
}): Promise<DataCollectionEventsResponse> {
  const subscription = await subscriptionManager.getSubscription(subscriptionId)

  const { cursor: newCursor, events } = await fullScanEvents(
    findHandler,
    {
      apiClient,
      credentials,
      parameters,
    },
    storage,
    cursor,
    subscription.data.events,
  )

  return {
    cursor: newCursor,
    events,
  }
}

export async function fullScanUnsubscribeHandler({
  subscriptionId,
  subscriptionManager,
}: ConnectorDataCollectionUnsubscribeRequest): Promise<DataCollectionUnsubscribeResponse> {
  await subscriptionManager.deleteSubscription(subscriptionId)
  return {}
}
