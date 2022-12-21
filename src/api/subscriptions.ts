import {
  WebhookUnsubscribeArgs,
  HandleWebhookResponse,
} from '@integration-app/connector-sdk'
import { BadRequestError } from '@integration-app/sdk/errors'
import {
  DataCollectionEvent,
  DataCollectionEventType,
} from '@integration-app/sdk/data-collections'
import { WebhookSubscribeArgs } from '@integration-app/connector-sdk/dist/handlers/data-collection'

export async function subscribeToCollection({
  apiClient,
  subscription,
  eventObject,
  connectorWebhookUri,
}: WebhookSubscribeArgs & {
  eventObject: string
}) {
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
  console.debug(
    `[Subscription ${subscription.id}] Unsubscribing from webhook ${subscriptionState.webhookId}`,
  )
  try {
    await apiClient.delete(`webhooks/${subscriptionState.webhookId}`)
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
