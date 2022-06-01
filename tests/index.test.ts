import { makeRequest } from './config'
import * as random from 'generate-random-data'

const SUPPORTED_FEATURES = {
  test: true,
  udm: {
    contacts: {
      unifiedFields: ['name', 'email'],
      events: true,
      find: true,
      create: true,
      update: true,
    },
    companies: {
      unifiedFields: ['name'],
    },
  },
}

describe('UDM', () => {
  let spec: any

  beforeEach(async () => {
    spec = await makeRequest('/')
  })

  describe('contacts', () => {
    it('should have contacts UDM', async () => {
      expect(spec.data.contacts).toBeDefined()
    })

    it('shoudl create contact with unified fields', async () => {
      const contactsCollectionUri = spec.data.contacts.uri

      const unifiedFields = {
        name: random.name(),
        email: random.email(),
      }

      const fieldsResponse = await makeRequest(
        `${contactsCollectionUri}/parse-unified-fields`,
        {
          udm: 'contacts',
          unifiedFields,
        },
      )
      const fields = fieldsResponse.fields

      const createResponse = await makeRequest(
        `${contactsCollectionUri}/create`,
        {
          fields,
        },
      )

      expect(createResponse.id).toBeDefined()

      const findByIdResponse = await makeRequest(
        `${contactsCollectionUri}/find-by-id`,
        {
          id: createResponse.id,
          udm: 'contacts',
        },
      )

      expect(findByIdResponse.record.unifiedFields).toEqual(unifiedFields)
    })
  })
})
