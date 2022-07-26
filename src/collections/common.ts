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

import { appendCustomFields, getCustomFields } from './custom-fields'

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
    extractRecord = (data) => ({
      ...data,
      ...extractRecordBuilder(data),
    })
  }
  let extractRecordSearch = extractRecord
  if (fs.existsSync(`${ymlDir}/extract-record-search.yml`)) {
    const extractRecordSearchBuilder = makeDataBuilder(
      `${ymlDir}/extract-record-search.yml`,
    )
    extractRecordSearch = (data) => ({
      ...data,
      ...extractRecordSearchBuilder(data),
    })
  }

  let extendFieldsSchema = null
  if (customFieldsPath !== null) {
    extendFieldsSchema = (request, fieldsSchema) =>
      appendCustomFields(customFieldsPath, request, fieldsSchema)
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
    extendFieldsSchema,
    extendSpec: async (
      _request: ConnectorRequestData,
      specFromYml: any,
    ): Promise<DataCollectionSpec> => {
      let customFieldsKeys = []
      let customFieldsRequired = []

      if (customFieldsPath !== null) {
        const customFields = await getCustomFields(
          customFieldsPath,
          _request.apiClient,
        )
        customFieldsKeys = customFields.map(({ key }) => key)
        customFieldsRequired = customFields
          .filter(({ mandatory_flag }) => mandatory_flag === true)
          .map(({ key }) => key)
      }

      const spec = {
        ...specFromYml,
      }
      if (queryFields) {
        spec.find = {
          queryFields,
        }
      }
      if (createFields) {
        spec.create = {
          fields: [...createFields, ...customFieldsKeys],
          requiredFields: [...requiredFields, ...customFieldsRequired],
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
