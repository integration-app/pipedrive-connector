import { makeRequest } from './config'
import * as random from 'generate-random-data'

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

      console.log('Create Response', createResponse)

      expect(createResponse.id).toBeDefined()

      console.log('CREATED CONTACT', createResponse.id)
    })
  })
})
