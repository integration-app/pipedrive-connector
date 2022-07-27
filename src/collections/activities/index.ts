import { ConnectorDataCollectionExtractUnifiedFieldsRequest } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'
import { UnifiedActivityFields } from '@integration-app/sdk/udm/activities'

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
  ymlDir: __dirname,
  path: 'activities',
  customFieldsPath: 'activityFields',
  name: 'Activities',
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  eventObject: 'activity',
  udm: 'activities',
  extendExtractUnifiedFields: async (
    request: ConnectorDataCollectionExtractUnifiedFieldsRequest,
    unifiedFields,
  ): Promise<UnifiedActivityFields> => {
    const fields = request.fields
    const participants = []
    if (fields.attendees) {
      participants.push(
        ...fields.attendees
          .filter((a) => a.user_id || a.person_id)
          .map((a) => ({
            userId: a.user_id,
            contactId: a.person_id,
          })),
      )
    }
    if (fields.participants) {
      participants.push(
        ...fields.participants
          .filter((a) => a.person_id)
          .map((a) => ({
            contactId: a.person_id,
          })),
      )
    }
    return {
      ...(unifiedFields ?? {}),
      participants,
    }
  },
  // extractUnifiedFields(fields) { // TODO: implement to merge attendees to participants
  // },
})

export default activities

export const ACTIVITY_SCHEMA = Type.Integer({
  title: 'Activity',
  referenceCollectionPath: activities.path,
})
