import { WebhookUnsubscribeArgs } from '@integration-app/connector-sdk'

export default async function unsubscribe(
  args: WebhookUnsubscribeArgs,
): Promise<void> {
  const { apiClient, subscriptionState } = args
  const state = subscriptionState as { webhookId: string }

  try {
    await apiClient.delete(`webhooks/${state.webhookId}`)
  } catch (err: any) {
    if (err?.data?.data?.errors?.[0] === 'not found') return
    throw err
  }
}
