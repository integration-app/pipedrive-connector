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
  fullScanSubscribeHandler,
  fullScanUnsubscribeHandler,
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
  updateSubscription,
} from '../api/subscriptions'
import * as fs from 'fs'
import {
  ConnectorDataCollectionExtractUnifiedFieldsRequest,
  makeCollectionHandler,
} from '@integration-app/connector-sdk'

export function objectCollectionHandler({
  ymlDir = null,
  path,
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
  if (fs.existsSync(`${ymlDir}/extract-record.yaml`)) {
    extractRecord = makeDataBuilder(`${ymlDir}/extract-record.yml`)
  }

  const find = (request) => {
    if (request.query) {
      return searchRecords({ ...request, path, extractRecord })
    } else {
      return getRecords({ ...request, path, extractRecord })
    }
  }

  const handler = makeCollectionHandler({
    ymlDir,
    path,
    name,
    udm,
    extendSpec: (
      _request: ConnectorRequestData,
      specFromYml: any,
    ): Promise<DataCollectionSpec> => {
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
          fields: createFields,
          requiredFields,
        }
      }
      if (updateFields) {
        spec.update = {
          fields: updateFields,
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
    handler.updateSubscription = updateSubscription
    handler.webhook = handleSubscriptionWebhook
  } else {
    handler.subscribe = (request) =>
      fullScanSubscribeHandler({ ...request, findHandler: find })
    handler.updateSubscription = updateSubscription
    handler.unsubscribe = fullScanUnsubscribeHandler
  }

  return handler
}
