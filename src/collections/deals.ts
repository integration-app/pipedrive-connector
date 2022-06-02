import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from './common'
import { UnifiedDealFields } from '@integration-app/sdk/udm/deals'
import { PIPELINE_SCHEMA, STAGES_SCHEMA } from './references'
import { USER_SCHEMA } from './users'

const FIELDS_SCHEMA = Type.Object({
  title: Type.String(),
  value: Type.String(),
  currency: Type.String(),
  user_id: USER_SCHEMA,
  person_id: Type.Integer({
    title: 'Person',
    referenceCollectionUri: 'data/collections/persons',
  }),
  org_id: Type.Integer({
    title: 'Organization',
    referenceCollectionUri: 'data/collections/organizations',
  }),
  pipeline_id: PIPELINE_SCHEMA,
  stage_id: STAGES_SCHEMA,
  status: Type.String({ enum: ['open', 'won', 'lost'] }),
  expected_close_date: Type.String({ format: 'date' }),
  probability: Type.Integer(),
  lost_reason: Type.String(),
})

const MODIFIABLE_FIELDS = [
  'title',
  'value',
  'currency',
  'user_id',
  'person_id',
  'org_id',
  'pipeline_id',
  'stage_id',
  'status',
  'expected_close_date',
  'probability',
  'lost_reason',
]

export default objectCollectionHandler({
  path: 'deals',
  name: 'Deals',
  fieldsSchema: FIELDS_SCHEMA,
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  lookupFields: ['title'],
  eventObject: 'deal',
  udm: 'deals',
  parseUnifiedFields,
  extractUnifiedFields,
})

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedDeal: UnifiedDealFields = unifiedFields
  return {
    fields: {
      title: unifiedDeal.name,
      value: unifiedDeal.amount?.toString?.(),
      org_id: unifiedDeal.companyId,
      user_id: unifiedDeal.ownerId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    name: fields.title,
    amount: fields.value ? parseFloat(fields.value) : null,
    companyId: fields.org_id?.toString(),
    ownerId: fields.user_id?.id?.toString(),
  }
}
