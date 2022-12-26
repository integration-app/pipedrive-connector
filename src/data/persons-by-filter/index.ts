import { objectCollectionHandler } from '../common'

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
  customFieldsPath: 'personFields',
  name: 'Persons',
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  updateFields: MODIFIABLE_FIELDS,
  queryFields: ['email', 'name', 'phone'],
  pullSubscription: true,
})

export default persons
