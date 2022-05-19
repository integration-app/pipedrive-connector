import {
  ConnectorDataCollectionSubscribeRequest,
  ConnectorDataCollectionUnsubscribeRequest,
  ConnectorSubscriptionWebhookRequest,
  fullScanEvents,
  fullScanSubscribe,
} from '@integration-app/connector-sdk'
import {
  DataCollectionEventsResponse,
  DataCollectionSubscribeResponse,
  DataCollectionUnsubscribeResponse,
  DataEvent,
  DataEventType,
} from '@integration-app/sdk/connector-api'
import { BadRequestError } from '@integration-app/sdk/errors'
import { defaultParseRecord } from './records'
import axios from 'axios'
import { ConnectorDataCollectionEventsRequest } from '@integration-app/connector-sdk/dist/server'

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
  apiClient,
  subscriptionManager,
  subscription,
  credentials,
  parameters,
  body,
}: ConnectorSubscriptionWebhookRequest) {
  const eventType = getDataEventType(body)

  const events = subscription.data.events

  switch (eventType) {
    case DataEventType.CREATED:
      if (!events.created) {
        return
      }
      break
    case DataEventType.UPDATED:
      if (!events.updated) {
        return
      }
      break
    case DataEventType.DELETED:
      if (!events.deleted) {
        return
      }
      break
  }

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
