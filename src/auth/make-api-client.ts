import { RestApiClient } from '@integration-app/connector-sdk'
import {
  BadRequestError,
  ConnectionError,
  ConnectionErrorKey,
} from '@integration-app/sdk/errors'

export default function makeApiClient({ credentials }) {
  const params: any = {
    baseUri: 'https://api.pipedrive.com/v1',
    onError: (error) => {
      if (error.response.status === 401) {
        throw new ConnectionError({
          message: 'Access token has expired',
          key: ConnectionErrorKey.ACCESS_TOKEN_EXPIRED,
        })
      }
    },
  }

  if (credentials.access_token) {
    params.headers = {
      Authorization: `Bearer ${credentials.access_token}`,
    }
  } else if (credentials.api_token) {
    // Backward compatibility for connections that use api_token.
    params.query = {
      api_token: credentials.api_token,
    }
  } else {
    throw new BadRequestError(
      'Either access_token or api_token must be provided',
    )
  }

  return new RestApiClient(params)
}
