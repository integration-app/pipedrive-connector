import * as random from 'generate-random-data'
import { activityFieldsToUpdate } from '../src/collections/activities'
import { dealFieldsToUpdate } from '../src/collections/deals'
import { companyFieldsToUpdate } from '../src/collections/organizations'
import { contactFieldsToUpdate } from '../src/collections/persons'
import { makeRequest } from './config'

const SUPPORTED_FEATURES = {
  test: true,
  udm: {
    contacts: {
      unifiedFields: ['fullName', 'email', 'phone'], // what's the best way to get these from the UDM?
      fieldsToUpdate: contactFieldsToUpdate,
      create: true,
      find: true,
      update: true,
      events: true,
    },
    companies: {
      unifiedFields: ['name', 'email', 'companyId', 'companyName', 'userId'],
      fieldsToUpdate: companyFieldsToUpdate,
      events: true,
      find: true,
      create: true,
      update: true,
    },
    activities: {
      unifiedFields: [
        'type',
        'description',
        'title',
        'dealId',
        'leadId',
        'contactId',
        'companyId',
        'userId',
      ],
      fieldsToUpdate: activityFieldsToUpdate,
      events: true,
      find: true,
      create: true,
      update: true,
    },
    deals: {
      unifiedFields: ['name', 'ownerId', 'companyId', 'amount'],
      fieldsToUpdate: dealFieldsToUpdate,
      events: true,
      find: true,
      create: true,
      update: true,
    },
  },
}

function fillWithValue(field: string) {
  switch (field) {
    case 'fullName':
      return random.name('Von')
    case 'email':
      return random.email('test.org')
    case 'phone':
      return random.mobile().toString()
    case 'deal_id':
    case 'lead_id':
    case 'contact_id':
    case 'company_id':
    case 'org_id':
    case 'owner_id':
      return random.pickOne(['1', '2', '3'])
    case 'companyName':
    case 'name':
      return random.word(10)
    default:
      return random.string(8)
  }
}

function generateRandomValues(unifiedFields: string[]) {
  return unifiedFields.reduce((fields, field) => {
    fields[field] = fillWithValue(field)
    return fields
  }, {})
}

describe('UDM', () => {
  let spec: any

  beforeEach(async () => {
    spec = await makeRequest('/')
  })
  for (const collection in SUPPORTED_FEATURES.udm) {
    const collectionProperties = SUPPORTED_FEATURES.udm[collection]
    const unifiedFields = generateRandomValues(
      collectionProperties.unifiedFields,
    )
    describe(`${collection}`, () => {
      it(`should have ${collection} UDM`, async () => {
        expect(spec.data[collection]).toBeDefined()
      })
      it(`should perform operations on ${collection}`, async () => {
        const collectionUri = spec.data[collection].uri
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
          console.log(`Created ${collection} with id ${createResponse.id}`)
        }
        if (collectionProperties.find) {
          const findByIdResponse = await makeRequest(
            `${collectionUri}/find-by-id`,
            {
              id: newRecordId || '1',
              udm: collection,
            },
          )
          expect(findByIdResponse.record.unifiedFields).toEqual(unifiedFields)
        }
        if (collectionProperties.update) {
          const updCreatedRecord = await makeRequest(
            `${collectionUri}/update`,
            {
              id: newRecordId || '1',
              fields: generateRandomValues(collectionProperties.fieldsToUpdate),
            },
          )
          expect(updCreatedRecord.fields.name).toBeDefined()
        }
      })
    })
  }
})
