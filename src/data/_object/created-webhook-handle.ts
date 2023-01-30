import {
  HandleWebhookResponse,
  WebhookHandlerArgs,
} from '@integration-app/connector-sdk'
import { DataCollectionEventType } from '@integration-app/sdk/data-collections'

export default async function webhookHandlerl(
  args: WebhookHandlerArgs,
): Promise<HandleWebhookResponse> {
  const { recordFromApi, body } = args

  const record = await recordFromApi(body)

  return {
    events: [
      {
        type: DataCollectionEventType.CREATED,
        record,
      },
    ],
  }
}
