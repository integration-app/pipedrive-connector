import {
  ConnectorRequestData,
  DataCollectionHandler,
  makeDataBuilder,
} from '@integration-app/connector-sdk'
import { DataCollectionSpec } from '@integration-app/sdk/connector-api'
import {
  createRecord,
  defaultExtractRecord,
  findRecordById,
  getRecords,
  searchRecords,
  updateRecord,
} from '../api/records'
import {
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'
import * as fs from 'fs'
import {
  ConnectorDataCollectionExtractUnifiedFieldsRequest,
  makeCollectionHandler,
} from '@integration-app/connector-sdk'
import { getCustomFields, getCustomFieldSchema } from '../api/custom-fields'

export function objectCollectionHandler({
  ymlDir = null,
  path,
  customFieldsPath = null,
  name,
  udm = null,
  createFields = null,
  requiredFields = null,
  updateFields = null,
  queryFields = null,
  eventObject = null,
  extendExtractUnifiedFields = null,
}: {
  ymlDir?: string
  path: string
  customFieldsPath?: string
  name: string
  fieldsSchema?: any
  udm?: string
  queryFields?: string[]
  createFields?: string[]
  requiredFields?: string[]
  updateFields?: string[]
  eventObject?: string
  extendExtractUnifiedFields?: (
    request: ConnectorDataCollectionExtractUnifiedFieldsRequest,
    unifiedFields: Record<string, any>,
  ) => Promise<Record<string, any>>
}): DataCollectionHandler {
  let extractRecord = defaultExtractRecord
  if (fs.existsSync(`${ymlDir}/extract-record.yml`)) {
    const extractRecordBuilder = makeDataBuilder(`${ymlDir}/extract-record.yml`)
    extractRecord = async (data) => {
      const record = await extractRecordBuilder(data)
      return {
        ...record,
        fields: {
          ...record.fields,
          ...data, // To add all the custom fields to the result
        },
      }
    }
  }
  let extractRecordSearch = extractRecord
  if (fs.existsSync(`${ymlDir}/extract-record-search.yml`)) {
    const extractRecordSearchBuilder = makeDataBuilder(
      `${ymlDir}/extract-record-search.yml`,
    )
    extractRecordSearch = async (data) => {
      const record = await extractRecordSearchBuilder(data)
      return {
        ...record,
        fields: {
          ...record.fields,
          ...data, // To add all the custom fields to the result
        },
      }
    }
  }

  const find = (request) => {
    if (request.query) {
      return searchRecords({
        ...request,
        path,
        extractRecord: extractRecordSearch,
      })
    } else {
      return getRecords({ ...request, path, extractRecord })
    }
  }

  const handler = makeCollectionHandler({
    ymlDir,
    path,
    name,
    udm,
    extendSpec: async (
      request: ConnectorRequestData,
      specFromYml: any,
    ): Promise<DataCollectionSpec> => {
      const spec = JSON.parse(JSON.stringify(specFromYml))

      const customFieldsKeys = []
      if (customFieldsPath !== null) {
        const customFields = await getCustomFields(
          customFieldsPath,
          request.apiClient,
        )
        for (const customField of customFields) {
          if (!(customField.key in spec.fieldsSchema.properties)) {
            console.log('Adding custom field', customField.key)
            spec.fieldsSchema.properties[customField.key] = {
              title: customField.name,
              ...getCustomFieldSchema(customField),
            }
            customFieldsKeys.push(customField.key)
          } else {
            console.log(customField.key, 'is in schema')
          }
        }
      }

      if (queryFields) {
        spec.find = {
          queryFields,
        }
      }
      if (createFields) {
        spec.create = {
          fields: [...createFields, ...customFieldsKeys],
          requiredFields: [...requiredFields],
        }
      }
      if (updateFields) {
        spec.update = {
          fields: [...updateFields, ...customFieldsKeys],
        }
      }
      return spec
    },
    find,
    findById: (request) => findRecordById({ ...request, path, extractRecord }),
    extendExtractUnifiedFields,
  })

  if (createFields) {
    handler.create = async (request) => createRecord({ ...request, path })
  }

  if (updateFields) {
    handler.update = async (request) => updateRecord({ ...request, path })
  }

  if (eventObject) {
    handler.subscribe = (request) =>
      subscribeToCollection({ ...request, eventObject })
    handler.unsubscribe = unsubscribeFromCollection
    handler.webhook = (request) =>
      handleSubscriptionWebhook({ ...request, extractRecord })
  }

  return handler
}
