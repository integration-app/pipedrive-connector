import {
  HandleWebhookResponse,
  WebhookHandlerArgs,
} from '@integration-app/connector-sdk'
import {
  DataCollectionEvent,
  DataCollectionEventType,
} from '@integration-app/sdk/data-collections'
import { BadRequestError } from '@integration-app/sdk/errors'

export default async function webhookHandlerl(
  args: WebhookHandlerArgs,
): Promise<HandleWebhookResponse> {
  const { body, subscription, recordFromApi } = args
  const eventType = getDataCollectionEventType(body)

  const events = subscription.events

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
        ? await recordFromApi(body.previous)
        : await recordFromApi(body.current),
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
