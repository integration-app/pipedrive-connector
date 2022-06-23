import { UNIFIED_DATA_MODELS } from '@integration-app/sdk/udm/index'
import * as dotenv from 'dotenv'
import * as env from 'env-var'
import * as random from 'generate-random-data'
import * as supertest from 'supertest'
import { server } from '../src/app'
dotenv.config()

const TEST_BASE_URI = env
  .get('TEST_BASE_URI')
  .default('http://endpoint:3000')
  .asString()
const TEST_ACCESS_TOKEN = env.get('TEST_ACCESS_TOKEN').asString()
const TEST_ACCESS_TOKEN_JSON = env.get('TEST_ACCESS_TOKEN_JSON').asString()

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
  return response.body // catch throuw error if status != 200
}

function fillWithValue(field: string) {
  switch (field) {
    case 'fullName':
      return random.name('Von')
    case 'email':
      return random.email('test.org')
    case 'phone':
      return random.mobile().toString()
    case 'amount':
      return random.integer(0, 1000000)
    case 'value':
      return random.integer(0, 10000)
    case 'expected_close_date':
      return random.randomDate()
    case 'isActive':
      return false
    case 'name':
      return 'Test Name - ' + random.integer()
    case 'companyName':
      return 'Test Company - ' + random.id()
    default:
      return 'Test Default - ' + random.id()
  }
}

export function generateRandomValues(unifiedFields: string[]) {
  return unifiedFields.reduce((fields, field) => {
    fields[field] = fillWithValue(field)
    return fields
  }, {})
}

export const dereference = async (
  udm: string,
  collection: string,
  fieldsToFind: string[],
) => {
  const res = await makeRequest(`/data/${collection}/find`, {
    udm: udm,
  })
  const data = res.records
  const references = {}

  for (const record of data) {
    for (const field of fieldsToFind) {
      if (record.unifiedFields[field]) {
        references[field] = record.unifiedFields[field]
      }
    }
    if (Object.keys(references).length === fieldsToFind.length) {
      break
    }
  }
  return references
}

export function extractReferences(collection: string): string[] {
  const udmFieldsDescription =
    UNIFIED_DATA_MODELS[collection].fieldsSchema.properties
  const fieldsWithReference = Object.keys(udmFieldsDescription).filter(
    (field) => {
      return (
        udmFieldsDescription[field].referenceUdm &&
        field !== 'createdBy' &&
        field !== 'updatedBy'
      )
    },
  )
  return fieldsWithReference
}
