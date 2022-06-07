import { UnifiedActivityFields } from '@integration-app/sdk/udm/activities'
import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from './common'
import { DEAL_SCHEMA } from './deals'
import { LEAD_SCHEMA } from './leads'
import { ORGANIZATION_SCHEMA } from './organizations'
import { PERSON_SCHEMA } from './persons'
import { ACTIVITY_TYPE_SCHEMA } from './references'
import { USER_SCHEMA } from './users'

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
  person_id: PERSON_SCHEMA,
  org_id: ORGANIZATION_SCHEMA,
  deal_id: DEAL_SCHEMA,
  lead_id: LEAD_SCHEMA,
  id: Type.Integer(),
  busy_flag: Type.Boolean(),
  add_time: Type.String({ format: 'date-time' }),
  marked_as_done_time: Type.String({ format: 'date-time' }),
  last_notification_time: Type.String({ format: 'date-time' }),
  last_notification_user_id: Type.Integer(),
  notification_language_id: Type.Integer(),
  active_flag: Type.Boolean(),
  update_time: Type.String({ format: 'date-time' }),
  update_user_id: USER_SCHEMA,
  created_by_user_id: USER_SCHEMA,
  location_subpremise: Type.String(),
  location_street_number: Type.String(),
  location_route: Type.String(),
  location_sublocality: Type.String(),
  location_locality: Type.String(),
  location_lat: Type.Number(),
  location_long: Type.Number(),
  location_admin_area_level_1: Type.String(),
  location_admin_area_level_2: Type.String(),
  location_country: Type.String(),
  location_postal_code: Type.String(),
  location_formatted_address: Type.String(),
  attendees: Type.Array(
    Type.Object({
      email_address: Type.String(),
      is_organizer: Type.Boolean(),
      name: Type.String(),
      person_id: PERSON_SCHEMA,
      status: Type.String(),
      user_id: USER_SCHEMA,
    }),
  ),
  participants: Type.Array(
    Type.Object({
      person_id: PERSON_SCHEMA,
      primary_flag: Type.Boolean(),
    }),
  ),
  org_name: Type.String(),
  person_name: Type.String(),
  deal_title: Type.String(),
  owner_name: Type.String(),
  person_dropbox_bcc: Type.String(),
  deal_dropbox_bcc: Type.String(),
  assigned_to_user_id: USER_SCHEMA,
  file: Type.Object({
    id: Type.String(),
    clean_name: Type.String(),
    url: Type.String(),
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

export { MODIFIABLE_FIELDS as activityFieldsToUpdate }
