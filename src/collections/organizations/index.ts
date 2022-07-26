import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from '../common'

const MODIFIABLE_FIELDS = ['name', 'owner_id']

const organizations = objectCollectionHandler({
  ymlDir: __dirname,
  path: 'organizations',
  customFieldsPath: 'organizationFields',
  name: 'Organizations',
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  queryFields: ['name', 'address'],
  eventObject: 'organization',
  udm: 'companies',
})

export default organizations

export const ORGANIZATION_SCHEMA = Type.Integer({
  title: 'Organization',
  referenceCollectionPath: organizations.path,
})
