import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = [
  'title',
  'owner_id',
  'label_ids',
  'person_id',
  'organization_id',
  'expected_close_date',
]

const leads = objectCollectionHandler({
  directory: __dirname,
  path: 'leads',
  name: 'Leads',
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  requiredFields: ['title'], // actually, you also has to provide either organization_id or person_id
  queryFields: ['title'],
  udm: 'leads',
})

export default leads

export const LEAD_SCHEMA = Type.Integer({
  title: 'Lead',
  referenceCollectionUri: leads.uri,
})
