import { RestApiClient } from '@integration-app/connector-sdk'

export const MAX_LIMIT = 100

export function makeAPIClient(apiToken) {
  return new RestApiClient({
    baseUri: 'https://api.pipedrive.com/v1',
    query: {
      api_token: apiToken,
    },
  })
}

export async function testConnection(apiToken) {
  const apiClient = makeAPIClient(apiToken)
  const result = await apiClient.get('/users/me')
  if (!result.success) {
    throw new Error('Test failed: unexpected response from `/users/me` request')
  }
}
