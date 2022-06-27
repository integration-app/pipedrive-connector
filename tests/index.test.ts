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
    const collectionKey = collectionProperties.key
    const collectionActions = collectionProperties.actions
    const udmFields = collectionProperties.unifiedFields

    describe(`${collection}`, () => {
      it(`should have ${collection} UDM`, async () => {
        expect(spec.data[collection]).toBeDefined()
      })
      it(`should perform operations on ${collection}`, async () => {
        const collectionUri = spec.data[collection].uri
        const fieldUpdates = await generateFieldUpdates(
          collection,
          collectionUri,
          collectionKey,
          udmFields,
        )
        let newRecordId = null
        if (collectionActions.includes('create')) {
          const createResponse = await makeRequest(`${collectionUri}/create`, {
            fields: fieldUpdates.fields,
          })
          expect(createResponse.id).toBeDefined()
          newRecordId = createResponse.id
          console.log(`Created ${collection} with id: ${newRecordId}`)
        }
        if (collectionActions.includes('find-by-id')) {
          const findByIdResponse = await makeRequest(
            `${collectionUri}/find-by-id`,
            {
              id: newRecordId,
              udm: collection,
            },
          )
          expect(findByIdResponse.record.unifiedFields).toMatchObject(
            fieldUpdates.allFields,
          )
        }
        if (collectionActions.includes('update')) {
          const fieldsToUpdate = await generateFieldUpdates(
            collection,
            collectionUri,
            collectionKey,
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
          console.log(`AllFields: ${JSON.stringify(fieldsToUpdate.allFields)}`)
          expect(findUpdatedRecord.record.unifiedFields).toMatchObject(
            fieldsToUpdate.allFields,
          )
        }
      }, 80000)
    })
  }
})
