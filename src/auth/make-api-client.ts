import { RestApiClient } from '@integration-app/connector-sdk'

export default function makeApiClient({ credentials }) {
  return new RestApiClient({
    baseUri: 'https://api.pipedrive.com/v1',
    query: {
      api_token: credentials.api_token,
    },
  })
}
