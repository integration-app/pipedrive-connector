import { objectCollectionHandler } from '../common'
import { Type } from '@sinclair/typebox'

const MODIFIABLE_FIELDS = [
  'name',
  'owner_id',
  'org_id',
  'email',
  'phone',
  'marketing_status',
]

const persons = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'persons',
  name: 'Persons',
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  updateFields: MODIFIABLE_FIELDS,
  queryFields: ['email', 'name', 'phone'],
  eventObject: 'person',
  udm: 'contacts',
})

export default persons

export const PERSON_SCHEMA = Type.Integer({
  title: 'Person',
  referenceCollectionPath: persons.path,
})
