import { UnifiedDealFields } from '@integration-app/sdk/udm/deals'
import { Type } from '@sinclair/typebox'
import { ACTIVITY_SCHEMA } from './activities'
import { objectCollectionHandler } from './common'
import { ORGANIZATION_SCHEMA } from './organizations'
import { PERSON_SCHEMA } from './persons'
import {
  ACTIVITY_TYPE_SCHEMA,
  PIPELINE_SCHEMA,
  STAGES_SCHEMA,
} from './references'
import { USER_SCHEMA } from './users'

const FIELDS_SCHEMA = Type.Object({
  active: Type.Boolean(),
  activities_count: Type.Integer(),
  add_time: Type.String({ format: 'date-time' }),
  cc_email: Type.String(),
  close_time: Type.String({ format: 'date-time' }),
  creator_user_id: USER_SCHEMA,
  currency: Type.String(),
  deleted: Type.Boolean(),
  done_activities_count: Type.Integer(),
  email_messages_count: Type.Integer(),
  expected_close_date: Type.String({ format: 'date' }),
  files_count: Type.Integer(),
  first_won_time: Type.String({ format: 'date-time' }),
  followers_count: Type.Integer(),
  formatted_value: Type.String(),
  formatted_weighted_value: Type.String(),
  label: Type.String(),
  last_activity_date: Type.String({ format: 'date' }),
  last_activity_id: ACTIVITY_SCHEMA,
  last_activity: Type.String({ format: 'date-time' }),
  last_incoming_mail_time: Type.String({ format: 'date-time' }),
  last_outgoing_mail_time: Type.String({ format: 'date-time' }),
  lost_reason: Type.String(),
  lost_time: Type.String({ format: 'date-time' }),
  next_activity_date: Type.String({ format: 'date' }),
  next_activity_duration: Type.String({ format: 'time' }),
  next_activity_id: ACTIVITY_SCHEMA,
  next_activity_note: Type.String(),
  next_activity_subject: Type.String(),
  next_activity_time: Type.String({ format: 'time' }),
  next_activity_type: ACTIVITY_TYPE_SCHEMA,
  next_activity: Type.String({ format: 'date-time' }),
  notes_count: Type.Integer(),
  org_id: ORGANIZATION_SCHEMA,
  org_name: Type.String(),
  owner_name: Type.String(),
  participants_count: Type.Integer(),
  person_id: PERSON_SCHEMA,
  person_name: Type.String(),
  pipeline_id: PIPELINE_SCHEMA,
  probability: Type.Integer(),
  products_count: Type.Integer(),
  stage_change_time: Type.String({ format: 'date-time' }),
  stage_id: STAGES_SCHEMA,
  stage_order_nr: Type.Integer(),
  status: Type.String({ enum: ['open', 'won', 'lost'] }),
  title: Type.String(),
  undone_activities_count: Type.Integer(),
  update_time: Type.String({ format: 'date-time' }),
  user_id: USER_SCHEMA,
  value: Type.String(),
  visible_to: Type.String(),
  weighted_value_currency: Type.String(),
  weighted_value: Type.Integer(),
  won_time: Type.String({ format: 'date-time' }),
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

const deals = objectCollectionHandler({
  path: 'deals',
  name: 'Deals',
  fieldsSchema: FIELDS_SCHEMA,
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['title'],
  updateFields: MODIFIABLE_FIELDS,
  lookupFields: ['title'],
  eventObject: 'deal',
  udm: 'deals',
  extractRecord,
  parseUnifiedFields,
  extractUnifiedFields,
})

export default deals

export const DEAL_SCHEMA = Type.Integer({
  title: 'Deal',
  referenceCollectionUri: deals.uri,
})

function extractRecord(item: any) {
  // Bring the structure to fieldSchema we use in other operations.
  const fields = {
    ...item,
    creator_user_id: item.creator_user_id.id,
    org_id: item.org_id?.value,
    person_id: item.person_id?.value,
    user_id: item.user_id?.id,
  }
  return {
    id: item.id.toString(),
    name: item.name,
    fields,
  }
}

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

async function extractUnifiedFields({ fields }) {
  return {
    name: fields.title,
    amount: fields.value ? parseFloat(fields.value) : null,
    companyId: fields.org_id?.toString(),
    ownerId: fields.user_id?.id?.toString(),
  }
}
