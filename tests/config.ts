import * as env from 'env-var'
import supertest from 'supertest'

const TEST_ACCESS_TOKEN_JSON = env
  .get('TEST_ACCESS_TOKEN_JSON')
  .required()
  .asString()

import { server } from '../src/server/app'

export function makeRequest(key: string, payload?: any) {
  return supertest('http://endpoint:3000')
    .post(`/${key}`)
    .set(
      'Authorization',
      `Bearer ${server.makeAccessToken(JSON.parse(TEST_ACCESS_TOKEN_JSON))}`,
    )
    .send(payload)
}
