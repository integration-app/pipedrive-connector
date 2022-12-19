import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = [
  'content',
  'person_id',
  'org_id',
  'deal_id',
  'lead_id',
]

const notes = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'notes',
  customFieldsPath: 'noteFields',
  name: 'Notes',
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  requiredFields: ['content', 'org_id'],
  eventObject: 'note',
})

export default notes

export const ACTIVITY_SCHEMA = Type.Integer({
  title: 'Notes',
  referenceCollectionPath: notes.path,
})
