import { WebhookUnsubscribeArgs } from '@integration-app/connector-sdk'

export default async function unsubscribe(
  args: WebhookUnsubscribeArgs,
): Promise<void> {
  const { apiClient, subscriptionState } = args

  const state = subscriptionState as { webhookId: string }

  await apiClient.get(state.webhookId + '/unsubscribe')
}
