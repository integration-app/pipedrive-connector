import { Type } from '@sinclair/typebox'
import { UnifiedActivityFields } from '@integration-app/sdk/udm/activities'
import { objectCollectionHandler } from './common'
import { USER_SCHEMA } from './users'
import { ACTIVITY_TYPE_SCHEMA } from './references'

const FIELDS_SCHEMA = Type.Object({
  type: ACTIVITY_TYPE_SCHEMA,
  subject: Type.String(),
  note: Type.String(),
  public_description: Type.String(),
  done: Type.Boolean(),
  due_date: Type.String({
    format: 'date',
  }),
  due_time: Type.String({
    format: 'time',
  }),
  duration: Type.String({
    format: 'time',
  }),
  location: Type.String(),
  user_id: USER_SCHEMA,
  person_id: Type.Integer({
    referenceCollectionUri: 'data/collections/persons',
  }),
  org_id: Type.Integer({
    title: 'Organization',
    referenceCollectionUri: 'data/collections/organizations',
  }),
  deal_id: Type.Integer({
    title: 'Deal',
    referenceCollectionUri: 'data/collections/deals',
  }),
  lead_id: Type.Integer({
    title: 'Lead',
    referenceCollectionUri: 'data/collections/leads',
  }),
})

const MODIFIABLE_FIELDS = [
  'type',
  'subject',
  'note',
  'public_description',
  'done',
  'due_date',
  'due_time',
  'duration',
  'location',
  'user_id',
  'person_id',
  'org_id',
  'deal_id',
  'lead_id',
]

const activities = objectCollectionHandler({
  path: 'activities',
  name: 'Activities',
  fieldsSchema: FIELDS_SCHEMA,
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  eventObject: 'activity',
  udm: 'activities',
  parseUnifiedFields,
  extractUnifiedFields,
})

export default activities

function extractUnifiedFields({ fields }): UnifiedActivityFields {
  return {
    title: fields.subject,
    description: fields.note,
    dealId: fields.deal_id,
    leadId: fields.lead_id,
    contactId: fields.person_id,
    companyId: fields.org_id,
    userId: fields.user_id,
  }
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedActivity = unifiedFields as UnifiedActivityFields
  return {
    fields: {
      subject: unifiedActivity.title,
      note: unifiedActivity.description,
      deal_id: unifiedActivity.dealId,
      lead_id: unifiedActivity.leadId,
      person_id: unifiedActivity.contactId,
      org_id: unifiedActivity.companyId,
      user_id: unifiedActivity.userId,
    },
  }
}
