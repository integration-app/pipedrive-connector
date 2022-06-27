import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { generateFieldUpdates, makeRequest } from './config'

describe('UDM', () => {
  let spec: any
  const collections = yaml.load(fs.readFileSync('supported-features.yaml'))

  beforeEach(async () => {
    spec = await makeRequest('/')
  })
  for (const collection in collections) {
    const collectionProperties = collections[collection]
    const collectionActions = collectionProperties.actions
    const udmFields = collectionProperties.unifiedFields
    let newRecordId = null

    describe(`${collection}`, () => {
      it(`should have ${collection} UDM`, async () => {
        expect(spec.data[collection]).toBeDefined()
      })
      if (collectionActions.includes('create')) {
        it(`should create ${collection}`, async () => {
          const collectionUri = spec.data[collection].uri
          const fieldUpdates = await generateFieldUpdates(
            collection,
            collectionUri,
            udmFields,
          )
          const createResponse = await makeRequest(`${collectionUri}/create`, {
            fields: fieldUpdates.fields,
          })
          expect(createResponse.id).toBeDefined()
          newRecordId = createResponse.id
          console.log(`Created ${collection} with id: ${newRecordId}`)
        })
      }
      if (collectionActions.includes('find-by-id')) {
        it(`should find created ${collection} by id`, async () => {
          const collectionUri = spec.data[collection].uri
          const findByIdResponse = await makeRequest(
            `${collectionUri}/find-by-id`,
            {
              id: newRecordId,
              udm: collection,
            },
          )
          expect(findByIdResponse.record.id.toString()).toBe(newRecordId)
          // Figure out how to get fieldUpdates from the test above
          // expect(findByIdResponse.record.unifiedFields).toMatchObject(
          //   fieldUpdates.unifiedFields,
          // )
        })
      }
      if (collectionActions.includes('update')) {
        it(`should update created ${collection}`, async () => {
          const collectionUri = spec.data[collection].uri
          const fieldsToUpdate = await generateFieldUpdates(
            collection,
            collectionUri,
            collectionProperties.updatableFields,
          )
          const updatedRecord = await makeRequest(`${collectionUri}/update`, {
            id: newRecordId,
            fields: fieldsToUpdate.fields,
          })
          const findUpdatedRecord = await makeRequest(
            `${collectionUri}/find-by-id`,
            {
              id: updatedRecord.id,
              udm: collection,
            },
          )
          console.log(
            `Record unifiedFields: ${JSON.stringify(
              findUpdatedRecord.record.unifiedFields,
            )}`,
          )
          expect(findUpdatedRecord.record.unifiedFields).toMatchObject(
            fieldsToUpdate.unifiedFields,
          )
        })
      }
    })
  }
})
