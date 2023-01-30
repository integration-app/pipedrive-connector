import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'

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
})

export default activities

export const ACTIVITY_SCHEMA = Type.Integer({
  title: 'Activity',
  referenceCollectionPath: activities.path,
})
