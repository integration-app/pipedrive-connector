import * as fs from 'fs'
import * as yaml from 'js-yaml'
import {
  dereference,
  extractReferences,
  generateRandomValues,
  makeRequest,
} from './config'

describe('UDM', () => {
  let spec: any
  const data = yaml.load(fs.readFileSync('./tests/supported-features.yaml'))

  beforeEach(async () => {
    spec = await makeRequest('/')
  })
  for (const collection in data) {
    const collectionProperties = data[collection]
    const collectionActions = collectionProperties.actions
    const basicFieldValues = generateRandomValues(
      collectionProperties.unifiedFields,
    )
    const fieldsWithReference: string[] = extractReferences(collection)

    describe(`${collection}`, () => {
      it(`should have ${collection} UDM`, async () => {
        expect(spec.data[collection]).toBeDefined()
      })
      it(`should perform operations on ${collection}`, async () => {
        const references = await dereference(
          collection,
          collectionProperties.key,
          fieldsWithReference,
        )
        const collectionUri = spec.data[collection].uri
        const unifiedFields = { ...basicFieldValues, ...references }
        console.log(`unifiedFields: ${JSON.stringify(unifiedFields)}`)

        const fieldsResponse = await makeRequest(
          `${collectionUri}/parse-unified-fields`,
          {
            udm: collection,
            unifiedFields: unifiedFields,
          },
        )
        const fields = fieldsResponse.fields
        console.log(`fields: ${JSON.stringify(fields)}`)

        let newRecordId = null
        if (collectionActions.includes('create')) {
          const createResponse = await makeRequest(`${collectionUri}/create`, {
            fields,
          })
          expect(createResponse.id).toBeDefined()
          newRecordId = createResponse.id
          console.log(`Created ${collection} with id: ${newRecordId}`)
        }
        if (collectionActions.includes('find')) {
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
        if (collectionActions.includes('update')) {
          const fieldsToUpdate = generateRandomValues(
            collectionProperties.updatableFields,
          )
          const updatedRecord = await makeRequest(`${collectionUri}/update`, {
            id: newRecordId,
            fields: fieldsToUpdate,
          })
          console.log(`Updated Record: ${JSON.stringify(updatedRecord)}`)
          const findUpdatedRecord = await makeRequest(
            `${collectionUri}/find-by-id`,
            {
              id: updatedRecord.id,
              udm: collection,
            },
          )
          const parsedUpdatedRecord = await makeRequest(
            `${collectionUri}/parse-unified-fields`,
            {
              udm: collection,
              unifiedFields: findUpdatedRecord.record.unifiedFields,
            },
          )
          expect(parsedUpdatedRecord.fields).toMatchObject(fieldsToUpdate)
        }
      })
    })
  }
})
