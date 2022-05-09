import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makePipelineSchema } from '../api/pipelines'
import { makeStageSchema } from '../api/stages'
import { makeVisibleToSchema } from '../api/visibility'
import {
  findInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import { UnifiedDealFields } from '@integration-app/sdk/udm/deals'
import users from './users'

const RECORD_KEY = 'deals'

const handler: DataCollectionHandler = {
  name: 'Deals',
  uri: '/data/collections/deals',
  fieldsSchema: getFieldsSchema,
  parseUnifiedFields: {
    'crm-deals': parseUnifiedFields,
  },
  extractUnifiedFields: {
    'crm-deals': extractUnifiedFields,
  },
  find: (request) =>
    findInCollection({
      recordKey: RECORD_KEY,
      ...request,
    }),
  create: async (request) =>
    createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
  update: async (request) =>
    updateCollectionRecord({
      recordKey: RECORD_KEY,
      ...request,
    }),
}

export default handler

async function getFieldsSchema({ apiClient }) {
  const type = Type.Partial(
    Type.Object({
      title: Type.String(),
      value: Type.String(),
      currency: Type.String(),
      user_id: Type.String({
        title: 'User',
        referenceCollectionUri: users.uri,
      }),
      person_id: Type.Integer({
        title: 'Person',
        referenceCollectionUri: 'data/collections/persons',
      }),
      org_id: Type.Integer({
        title: 'Organization',
        referenceCollectionUri: 'data/collections/organizations',
      }),
      pipeline_id: await makePipelineSchema(apiClient),
      stage_id: await makeStageSchema(apiClient),
      status: Type.String({ enum: ['open', 'won', 'lost'] }),
      expected_close_date: Type.String({ format: 'date' }),
      probability: Type.Integer(),
      lost_reason: Type.String(),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['title']
  return type
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedDeal: UnifiedDealFields = unifiedFields
  return {
    fields: {
      name: unifiedDeal.name,
      value: unifiedDeal.amount?.toString?.(),
      org_id: unifiedDeal.companyId,
      user_id: unifiedDeal.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    name: fields.name,
    amount: fields.value ? parseFloat(fields.value) : null,
    companyId: fields.org_id?.toString(),
    userId: fields.user_id?.id?.toString(),
  }
}
