import { RestApiClient } from '@integration-app/connector-sdk'
import {
  ConnectionError,
  ConnectionErrorKey,
} from '@integration-app/sdk/errors'

export default function makeApiClient({ credentials }) {
  return new RestApiClient({
    baseUri: 'https://api.pipedrive.com/v1',
    headers: {
      Authorization: `Bearer ${credentials.access_token}`,
    },
    // Backward compatibility for connections that use api_token.
    query: {
      api_token: credentials.api_token,
    },
    onError: (error) => {
      if (error.response.status === 401) {
        throw new ConnectionError({
          message: 'Access token has expired',
          key: ConnectionErrorKey.ACCESS_TOKEN_EXPIRED,
        })
      }
    },
  })
}
