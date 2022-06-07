import { UnifiedContactFields } from '@integration-app/sdk/udm/contacts'
import { Type } from '@sinclair/typebox'
import { objectCollectionHandler } from './common'
import { ORGANIZATION_SCHEMA } from './organizations'
import { USER_SCHEMA } from './users'

const FIELDS_SCHEMA = Type.Object({
  name: Type.String(),
  owner_id: USER_SCHEMA,
  org_id: ORGANIZATION_SCHEMA,
  email: Type.Array(Type.String(), { title: 'Email(s)' }),
  phone: Type.Array(Type.String(), { title: 'Phone(s)' }),
  marketing_status: Type.String({
    title: 'Marketing Status',
    enum: ['no_consent', 'unsubscribed', 'subscribed', 'archived'],
  }),
})

const MODIFIABLE_FIELDS = [
  'name',
  'owner_id',
  'org_id',
  'email',
  'phone',
  'marketing_status',
]

const persons = objectCollectionHandler({
  path: 'persons',
  name: 'Persons',
  fieldsSchema: FIELDS_SCHEMA,
  createFields: MODIFIABLE_FIELDS,
  requiredFields: ['name'],
  updateFields: MODIFIABLE_FIELDS,
  lookupFields: ['email', 'name', 'phone'],
  eventObject: 'person',
  udm: 'contacts',
  extractRecord,
  parseUnifiedFields,
  extractUnifiedFields,
})

export default persons

export const PERSON_SCHEMA = Type.Integer({
  title: 'Person',
  referenceCollectionUri: persons.uri,
})

function extractRecord(item: any) {
  // Bring the structure to fieldSchema we use in other operations.
  const fields = {
    ...item,
    org_id: item.org_id?.value,
    owner_id: item.owner_id?.id,
    phone: item.phone?.map((phone) => phone.value),
    email: item.email?.map((email) => email.value),
  }
  return {
    id: item.id.toString(),
    name: item.name,
    fields,
  }
}

function extractUnifiedFields({ fields }): UnifiedContactFields {
  return {
    name: fields.name,
    email: fields.email?.[0]?.value,
    companyId: fields.org_id,
    companyName: fields.org_name,
    userId: fields.owner_id?.id,
  }
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedContact: UnifiedContactFields = unifiedFields
  return {
    fields: {
      name: unifiedContact.name,
      email: unifiedFields.email ? [unifiedFields.email] : undefined,
      org_id: unifiedContact.companyId,
      owner_id: unifiedContact.userId,
    },
  }
}

export { MODIFIABLE_FIELDS as contactFieldsToUpdate }
