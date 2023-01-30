import { WebhookSubscribeArgs } from '@integration-app/connector-sdk'

export default async function subscribe(
  args: WebhookSubscribeArgs,
): Promise<{ webhookId: string }> {
  const { apiClient } = args

  const response = await apiClient.post('subscribe')

  return {
    webhookId: response.webhookId,
  }
}
