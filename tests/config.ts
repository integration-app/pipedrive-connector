import * as dotenv from 'dotenv'
dotenv.config()

import * as env from 'env-var'
import * as supertest from 'supertest'

const TEST_BASE_URI = env
  .get('TEST_BASE_URI')
  .default('http://endpoint:3000')
  .asString()
const TEST_ACCESS_TOKEN = env.get('TEST_ACCESS_TOKEN').asString()
const TEST_ACCESS_TOKEN_JSON = env.get('TEST_ACCESS_TOKEN_JSON').asString()

import { server } from '../src/app'

export async function makeRequest(uri: string, payload?: any) {
  let token
  if (TEST_ACCESS_TOKEN) {
    token = TEST_ACCESS_TOKEN
  } else if (TEST_ACCESS_TOKEN_JSON) {
    token = server.makeAccessToken(JSON.parse(TEST_ACCESS_TOKEN_JSON))
  } else {
    throw new Error(
      'Neither TEST_ACCESS_TOKEN nor TEST_ACCESS_TOKEN_JSON is set',
    )
  }
  const response = await supertest(TEST_BASE_URI)
    .post(uri)
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
  return response.body
}
