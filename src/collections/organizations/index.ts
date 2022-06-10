import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = ['name', 'owner_id']

const organizations = objectCollectionHandler({
  directory: __dirname,
  path: 'organizations',
  name: 'Organizations',
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  lookupFields: ['name'],
  eventObject: 'organization',
  udm: 'companies',
})

export default organizations

export const ORGANIZATION_SCHEMA = Type.Integer({
  title: 'Organization',
  referenceCollectionUri: organizations.uri,
})
