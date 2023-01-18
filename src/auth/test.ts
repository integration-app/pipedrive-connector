import makeAPIClient from './make-api-client'

export default async function testAuth({ connectionParameters }) {
  const apiClient = makeAPIClient(connectionParameters.apiToken)
  try {
    const result = await apiClient.get('/users/me')
    if (!result.success) {
      throw new Error(
        'Test failed: unexpected response from `/users/me` request',
      )
    }
  } catch (e: any) {
    if (e.data?.data?.errorCode === 401) {
      throw new Error('Invalid API token')
    } else {
      throw e
    }
  }
}
