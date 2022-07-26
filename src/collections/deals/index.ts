import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'

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
  ymlDir: __dirname,
  path: 'deals',
  customFieldsPath: 'dealFields',
  name: 'Deals',
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['title'],
  updateFields: MODIFIABLE_FIELDS,
  queryFields: ['title'],
  eventObject: 'deal',
  udm: 'deals',
})

export default deals

export const DEAL_SCHEMA = Type.Integer({
  title: 'Deal',
  referenceCollectionPath: deals.path,
})
