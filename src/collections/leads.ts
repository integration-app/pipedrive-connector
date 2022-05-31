import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makeLeadLabelSchema } from '../api/lead-labels'
import {
  findInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import { UnifiedLeadFields } from '@integration-app/sdk/udm/leads'
import users from './users'
import {
  fullScanEventsHandler,
  fullScanSubscribeHandler,
  fullScanUnsubscribeHandler,
} from '../api/subscriptions'
import { lookupRecords } from '../api/records'

const OBJECT_PATH = 'leads'
const LOOKUP_FIELDS = ['title']

const handler: DataCollectionHandler = {
  name: 'Leads',
  uri: '/data/collections/leads',
  fieldsSchema: getFieldsSchema,
  parseUnifiedFields: {
    leads: parseUnifiedFields,
  },
  extractUnifiedFields: {
    leads: extractUnifiedFields,
  },
  find: {
    handler: findHandler,
  },
  lookup: {
    fields: LOOKUP_FIELDS,
    handler: async (request) =>
      lookupRecords({ ...request, path: OBJECT_PATH }),
  },
  create: {
    handler: async (request) =>
      createCollectionRecord({ path: OBJECT_PATH, ...request }),
  },
  update: {
    handler: async (request) =>
      updateCollectionRecord({
        path: OBJECT_PATH,
        ...request,
      }),
  },
  events: {
    subscribeHandler: (request) =>
      fullScanSubscribeHandler({ ...request, findHandler }),
    unsubscribeHandler: fullScanUnsubscribeHandler,
    eventsHandler: (request) =>
      fullScanEventsHandler({ ...request, findHandler }),
  },
}

export default handler

async function findHandler(request) {
  return findInCollection({
    path: OBJECT_PATH,
    ...request,
  })
}

export async function getFieldsSchema({ apiClient }) {
  const type = Type.Partial(
    Type.Object({
      title: Type.String(),
      owner_id: Type.Number({
        title: 'Owner',
        referenceCollectionUri: users.uri,
      }),
      label_ids: Type.Array(await makeLeadLabelSchema(apiClient), {
        title: 'Labels',
      }),
      person_id: Type.Integer({
        referenceCollectionUri: 'data/collections/persons',
      }),
      organization_id: Type.Integer({
        referenceCollectionUri: 'data/collections/organizations',
      }),
      expected_close_date: Type.String({
        format: 'date',
        title: 'Expected Close Date',
      }),
    }),
  )
  type.required = ['title']
  return type
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedLead: UnifiedLeadFields = unifiedFields
  return {
    fields: {
      title: unifiedLead.name,
      organization_id: unifiedLead.companyId,
      owner_id: unifiedLead.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    name: fields.title,
    companyId: fields.organization_id,
    userId: fields.owner_id,
  }
}
