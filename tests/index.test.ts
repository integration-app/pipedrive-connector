import { UNIFIED_DATA_MODELS } from '@integration-app/sdk/udm/index'
import * as random from 'generate-random-data'
import { makeRequest } from './config'

const SUPPORTED_FEATURES = {
  test: true,
  udm: {
    contacts: {
      unifiedFields: ['fullName', 'email', 'companyId', 'ownerId'],
      collectionName: 'persons',
      updatableFields: ['name'], // make it work for email and phone that are Arrays
      create: true,
      find: true,
      update: true,
      events: false,
    },
    leads: {
      unifiedFields: ['name', 'companyId', 'userId'],
      collectionName: 'leads',
      updatableFields: ['title', 'expected_close_date'],
      create: true,
      find: true,
      update: false,
      events: false,
    },
    companies: {
      unifiedFields: ['name', 'userId'],
      collectionName: 'organizations',
      updatableFields: ['name'],
      find: true,
      create: true,
      update: true,
      events: false,
    },
    activities: {
      unifiedFields: [
        'description',
        'title',
        'dealId',
        'leadId',
        'contactId',
        'companyId',
        'userId',
      ],
      collectionName: 'activities',
      updatableFields: ['subject'],
      find: true,
      create: true,
      update: true,
      events: false,
    },
    deals: {
      unifiedFields: ['name', 'ownerId', 'companyId', 'amount'],
      collectionName: 'deals',
      updatableFields: ['title', 'value'],
      find: true,
      create: true,
      update: true,
      events: false,
    },
  },
}
// generate random data based on types (from UNIFIED_DATA_MODELS in sdk)
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
    case 'name':
      return 'Test Name - ' + random.integer()
    case 'createdTime':
      return random.randomDate()
    case 'updatedTime':
      return random.randomDate()
    case 'expected_close_date':
      return random.randomDate()
    case 'companyName':
      return 'Test Company - ' + random.integer()
    default:
      return 'Test Default - ' + random.string(4)
  }
}

function generateRandomValues(unifiedFields: string[]) {
  return unifiedFields.reduce((fields, field) => {
    fields[field] = fillWithValue(field)
    return fields
  }, {})
}

const realReferences = async (
  udm: string,
  collection: string,
  fieldsToFind: string[],
) => {
  // getting the refernce values from the first collection record
  const res = await makeRequest(`/data/${collection}/find`, {
    udm: udm,
  })
  const data = res.records
  const references = {}
  // for every record in data, check if the field is in the fieldsToFind array
  // if it is, get the value of the field and add it to the references object
  // stop when all the fieldsToFind are found
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

describe('UDM', () => {
  let spec: any

  beforeEach(async () => {
    spec = await makeRequest('/')
  })
  for (const collection in SUPPORTED_FEATURES.udm) {
    const collectionProperties = SUPPORTED_FEATURES.udm[collection]
    const basicFieldValues = generateRandomValues(
      collectionProperties.unifiedFields,
    )
    const fieldsWithReference: string[] = extractReferences(collection)

    describe(`${collection}`, () => {
      it(`should have ${collection} UDM`, async () => {
        expect(spec.data[collection]).toBeDefined()
      })
      it(`should perform operations on ${collection}`, async () => {
        const references = await realReferences(
          collection,
          collectionProperties.collectionName,
          fieldsWithReference,
        )
        const collectionUri = spec.data[collection].uri
        const unifiedFields = { ...basicFieldValues, ...references }

        const fieldsResponse = await makeRequest(
          `${collectionUri}/parse-unified-fields`,
          {
            udm: collection,
            unifiedFields: unifiedFields,
          },
        )
        const fields = fieldsResponse.fields

        let newRecordId = null
        if (collectionProperties.create) {
          const createResponse = await makeRequest(`${collectionUri}/create`, {
            fields,
          })
          expect(createResponse.id).toBeDefined()
          newRecordId = createResponse.id
          console.log(`Created ${collection} with id: ${newRecordId}`)
        }
        if (collectionProperties.find) {
          const findByIdResponse = await makeRequest(
            `${collectionUri}/find-by-id`,
            {
              id: newRecordId,
              udm: collection,
            },
          )
          expect(findByIdResponse.record.unifiedFields).toMatchObject(
            unifiedFields,
          )
        }
        if (collectionProperties.update) {
          const fieldsToUpdate = generateRandomValues(
            collectionProperties.updatableFields,
          )
          const updatedRecord = await makeRequest(`${collectionUri}/update`, {
            id: newRecordId,
            fields: fieldsToUpdate,
          })
          const res = updatedRecord.logs[0].response.data.data
          for (const field in fieldsToUpdate) {
            expect(res[field]).toEqual(fieldsToUpdate[field])
          }
        }
      })
    })
  }
})
function extractReferences(collection: string): string[] {
  const udmFieldsDescription =
    UNIFIED_DATA_MODELS[collection].fieldsSchema.properties
  return Object.keys(udmFieldsDescription).filter(
    (field) => udmFieldsDescription[field].referenceUdm,
  )
}
