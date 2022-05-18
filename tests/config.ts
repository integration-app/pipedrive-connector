import * as env from 'env-var'
import supertest from 'supertest'

const TEST_ACCESS_TOKEN_JSON = env
  .get('TEST_ACCESS_TOKEN_JSON')
  .required()
  .asString()

import { server } from '../src/app'

export function makeRequest(uri: string, payload?: any) {
  return supertest('http://endpoint:3000')
    .post(uri)
    .set(
      'Authorization',
      `Bearer ${server.makeAccessToken(JSON.parse(TEST_ACCESS_TOKEN_JSON))}`,
    )
    .send(payload)
}
