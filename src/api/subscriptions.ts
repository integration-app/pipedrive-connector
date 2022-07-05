import {
  ConnectorDataCollectionSubscribeRequest,
  ConnectorDataCollectionUnsubscribeRequest,
} from '@integration-app/connector-sdk'
import { DataCollectionUnsubscribeResponse } from '@integration-app/sdk/connector-api'
import { BadRequestError } from '@integration-app/sdk/errors'
import {
  DataCollectionEvent,
  DataCollectionEventType,
} from '@integration-app/sdk/data-collections'

export async function subscribeToCollection({
  apiClient,
  subscription,
  subscriptionManager,
  eventObject,
}: ConnectorDataCollectionSubscribeRequest & {
  eventObject: string
}) {
  const webhookResponse = await apiClient.post('webhooks', {
    subscription_url: subscription.connectorWebhookUri,
    event_action: '*',
    event_object: eventObject,
  })

  await subscriptionManager.setSubscriptionState(subscription.id, {
    webhookId: webhookResponse.data.id,
  })

  return {}
}

export async function unsubscribeFromCollection({
  apiClient,
  subscription,
}: ConnectorDataCollectionUnsubscribeRequest): Promise<DataCollectionUnsubscribeResponse> {
  console.debug('Unsubscribing from subscription', subscription)

  await apiClient.delete(`webhooks/${subscription.state.webhookId}`)

  return {}
}

export async function handleSubscriptionWebhook({
  subscription,
  body = null,
  extractRecord,
}): Promise<DataCollectionEvent[]> {
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

  return [event]
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
