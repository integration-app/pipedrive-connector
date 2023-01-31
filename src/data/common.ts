import {
  DataCollectionHandler,
  DataCollectionSpecArgs,
  WebhookSubscriptionHandler,
} from '@integration-app/connector-sdk'
import { DataCollectionSpec } from '@integration-app/sdk/connector-api'
import { getCustomFields, getCustomFieldSchema } from '../api/custom-fields'
import { getFilterById } from '../api/filters'
import { createRecord, findRecordById, updateRecord } from '../api/records'
import {
  handleSubscriptionWebhook,
  subscribeToCollection,
  unsubscribeFromCollection,
} from '../api/subscriptions'

export function objectCollectionHandler({
  ymlDir,
  path,
  customFieldsPath = null,
  name,
  createFields = null,
  requiredFields = null,
  updateFields = null,
  queryFields = null,
  eventObject = null,
  subscription = null,
  activeOnly,
}: {
  ymlDir?: string
  path: string
  customFieldsPath?: string
  name: string
  fieldsSchema?: any
  queryFields?: string[]
  createFields?: string[]
  requiredFields?: string[]
  updateFields?: string[]
  eventObject?: string
  subscription?: any
  activeOnly?: boolean
}): DataCollectionHandler {
  ymlDir
  activeOnly
  const extractRecord = (record) => record
  const handler = new DataCollectionHandler({
    findById: (request) => findRecordById({ ...request, path, extractRecord }),
  })

  handler.spec = async (
    request: DataCollectionSpecArgs,
  ): Promise<DataCollectionSpec> => {
    const spec = request.spec
    const filter = request.parameters?.filter_id
      ? await getFilterById(request.apiClient, request.parameters.filter_id)
      : null
    spec.name = filter?.name ?? name

    const editableCustomFieldKeys = []
    if (customFieldsPath !== null) {
      const customFields = await getCustomFields(
        customFieldsPath,
        request.apiClient,
      )
      for (const customField of customFields) {
        if (!(customField.key in spec.fieldsSchema.properties)) {
          spec.fieldsSchema.properties[customField.key] = {
            title: customField.name,
            ...getCustomFieldSchema(customField),
          }
          if (customField.edit_flag) {
            editableCustomFieldKeys.push(customField.key)
          }
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
        fields: [...createFields, ...editableCustomFieldKeys],
        requiredFields,
      }
    }
    if (updateFields) {
      spec.update = {
        fields: [...updateFields, ...editableCustomFieldKeys],
      }
    }

    return spec
  }

  if (createFields) {
    handler.create = async (request) => createRecord({ ...request, path })
  }

  if (updateFields) {
    handler.update = async (request) => updateRecord({ ...request, path })
  }

  if (subscription) {
    handler.subscription = subscription
  } else if (eventObject) {
    handler.subscription = new WebhookSubscriptionHandler({
      subscribe: (args) => subscribeToCollection({ ...args, eventObject }),
      unsubscribe: unsubscribeFromCollection,
      handleWebhook: (args) =>
        handleSubscriptionWebhook({ ...args, extractRecord }),
    })
  }

  return handler
}
