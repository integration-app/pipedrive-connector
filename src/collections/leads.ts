import { objectCollectionHandler } from './common'
import { Type } from '@sinclair/typebox'
import { UnifiedLeadFields } from '@integration-app/sdk/udm/leads'
import users from './users'
import { LEAD_LABEL_SCHEMA } from './references'
import { PERSON_SCHEMA } from './persons'
import { ORGANIZATION_SCHEMA } from './organizations'

const FIELDS_SCHEMA = Type.Object({
  title: Type.String(),
  owner_id: Type.Number({
    title: 'Owner',
    referenceCollectionUri: users.uri,
  }),
  label_ids: Type.Array(LEAD_LABEL_SCHEMA, {
    title: 'Labels',
  }),
  person_id: PERSON_SCHEMA,
  organization_id: ORGANIZATION_SCHEMA,
  expected_close_date: Type.String({
    format: 'date',
    title: 'Expected Close Date',
  }),
})

const MODIFIABLE_FIELDS = [
  'title',
  'owner_id',
  'label_ids',
  'person_id',
  'organization_id',
  'expected_close_date',
]

const leads = objectCollectionHandler({
  path: 'leads',
  name: 'Leads',
  fieldsSchema: FIELDS_SCHEMA,
  createFields: MODIFIABLE_FIELDS,
  updateFields: MODIFIABLE_FIELDS,
  requiredFields: ['title'],
  lookupFields: ['title'],
  udm: 'leads',
  parseUnifiedFields,
  extractUnifiedFields,
})

export default leads

export const LEAD_SCHEMA = Type.Integer({
  title: 'Lead',
  referenceCollectionUri: leads.uri,
})

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedLead: UnifiedLeadFields = unifiedFields
  return {
    fields: {
      title: unifiedLead.name,
      organization_id: unifiedLead.companyId,
      owner_id: unifiedLead.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    name: fields.title,
    companyId: fields.organization_id,
    userId: fields.owner_id,
  }
}
