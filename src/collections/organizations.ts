import { UnifiedCompanyFields } from '@integration-app/sdk/udm/companies'
import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from './common'
import { USER_SCHEMA } from './users'

const FIELDS_SCHEMA = Type.Object({
  name: Type.String(),
  owner_id: {
    ...USER_SCHEMA,
    title: 'Owner',
  },
})

const MODIFIABLE_FIELDS = ['name', 'owner_id']

const organizations = objectCollectionHandler({
  path: 'organizations',
  name: 'Organizations',
  fieldsSchema: FIELDS_SCHEMA,
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  lookupFields: ['name'],
  eventObject: 'organization',
  udm: 'companies',
  parseUnifiedFields,
  extractUnifiedFields,
})

export default organizations

export const ORGANIZATION_SCHEMA = Type.Integer({
  title: 'Organization',
  referenceCollectionUri: organizations.uri,
})

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedCompany: UnifiedCompanyFields = unifiedFields
  return {
    fields: {
      name: unifiedCompany.name,
      owner_id: unifiedCompany.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    name: fields.name,
    userId: fields.owner_id?.id,
  }
}

export { MODIFIABLE_FIELDS as companyFieldsToUpdate }
