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
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import { buildData } from '@integration-app/sdk/data-builder'

export function objectCollectionHandler({
  directory = null,
  path,
  name,
  fieldsSchema = null,
  udm = null,
  extractRecord = null,
  parseUnifiedFields = null,
  extractUnifiedFields = null,
  createFields = null,
  requiredFields = null,
  updateFields = null,
  lookupFields = null,
  eventObject = null,
}: {
  directory?: string
  path: string
  name: string
  fieldsSchema?: any
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

  if (!fieldsSchema && directory) {
    fieldsSchema = loadSchema(`${directory}/fields-schema.yaml`)
    if (!fieldsSchema) {
      throw new Error('Fields schema is required')
    }
  }
  if (!extractUnifiedFields && directory) {
    const dataBuilder = dataBuilderFromYaml(
      `${directory}/extract-unified-fields.yaml`,
    )
    extractUnifiedFields = async ({ fields }) => await dataBuilder(fields)
  }

  if (!parseUnifiedFields && directory) {
    const dataBuilder = dataBuilderFromYaml(
      `${directory}/parse-unified-fields.yaml`,
    )
    parseUnifiedFields = async ({ unifiedFields }) => ({
      fields: await dataBuilder(unifiedFields),
    })
  }

  if (
    !extractRecord &&
    directory &&
    fs.existsSync(`${directory}/extract-record.yaml`)
  ) {
    extractRecord = dataBuilderFromYaml(`${directory}/extract-record.yaml`)
  }

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

function loadSchema(path) {
  const schema = loadYaml(path)
  // ToDo: validate schema
  return schema
}

function dataBuilderFromYaml(path): (data: any) => Promise<any> {
  const recipe = loadYaml(path)
  return async (data) => {
    return buildData(recipe, data)
  }
}

function loadYaml(path) {
  return yaml.load(fs.readFileSync(path))
}
