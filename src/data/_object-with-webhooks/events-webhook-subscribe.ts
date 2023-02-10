import { WebhookSubscribeArgs } from '@integration-app/connector-sdk'

export default async function subscribe(
  args: WebhookSubscribeArgs,
): Promise<{ webhookId: string }> {
  const { apiClient, connectorWebhookUri, parameters } = args

  const webhookResponse = await apiClient.post('webhooks', {
    subscription_url: connectorWebhookUri,
    event_action: '*',
    event_object: parameters.eventObject,
  })

  return {
    webhookId: webhookResponse.data.id,
  }
}
