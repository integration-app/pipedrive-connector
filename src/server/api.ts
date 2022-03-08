import axios from 'axios'
import urljoin from 'url-join'

const API_URI = 'https://api.pipedrive.com/v1'

export const MAX_LIMIT = 100

export async function get(credentials, path, params = null) {
  return makeApiRequest(credentials, 'GET', path, params)
}

export async function post(credentials, path, data) {
  return makeApiRequest(credentials, 'POST', path, data)
}

export async function put(credentials, path, data) {
  return makeApiRequest(credentials, 'PUT', path, data)
}

export async function makeApiRequest(
  credentials: any,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  data?: any,
) {
  const params = {
    api_token: credentials.api_token,
    // If method is 'GET', put data into query params
    ...(method === 'GET' ? data ?? {} : {}),
  }
  const response = await axios.request({
    url: urljoin(API_URI, path),
    params,
    data: method === 'GET' ? undefined : data,
    method: method,
  })
  return response.data
}
