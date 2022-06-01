import {
  DataCollectionHandler,
  ExtractUnifiedFieldsHandler,
  ParseUnifiedFieldsHandler,
} from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'
import {
  createRecord,
  findRecordById,
  getRecords,
  lookupRecords,
  updateRecord,
} from '../api/records'
import {
  fullScanSubscribeHandler,
  fullScanUnsubscribeHandler,
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'

export function objectCollectionHandler({
  path,
  name,
  fieldsSchema,
  udm = null,
  extractRecord = null,
  parseUnifiedFields = null,
  extractUnifiedFields = null,
  createFields = null,
  updateFields = null,
  lookupFields = null,
  eventObject = null,
}: {
  path: string
  name: string
  fieldsSchema: any
  udm?: string
  extractRecord?: (record: any) => any
  parseUnifiedFields?: ParseUnifiedFieldsHandler
  extractUnifiedFields?: ExtractUnifiedFieldsHandler
  lookupFields?: string[]
  createFields?: string[]
  requiredFields?: string[]
  updateFields?: string[]
  eventObject?: string
}): DataCollectionHandler {
  const find = (request) => getRecords({ ...request, path, extractRecord })

  const handler: DataCollectionHandler = {
    uri: `/data/${path}`,

    spec: () => {
      const spec: any = {
        type: DataLocationType.collection,
        name,
        fieldsSchema,
      }
      if (lookupFields) {
        spec.lookup = {
          fields: lookupFields,
        }
      }
      return spec
    },

    find,

    findById: (request) => findRecordById({ ...request, path, extractRecord }),
  }

  if (udm) {
    if (parseUnifiedFields) {
      handler.parseUnifiedFields = {
        [udm]: parseUnifiedFields,
      }
    }
    if (extractUnifiedFields) {
      handler.extractUnifiedFields = {
        [udm]: extractUnifiedFields,
      }
    }
  }

  if (lookupFields) {
    handler.lookup = (request) =>
      lookupRecords({ ...request, path, extractRecord })
  }

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
    handler.webhook = handleSubscriptionWebhook
  } else {
    handler.subscribe = (request) =>
      fullScanSubscribeHandler({ ...request, findHandler: find })
    handler.unsubscribe = fullScanUnsubscribeHandler
  }

  return handler
}
