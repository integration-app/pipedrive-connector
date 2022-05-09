import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makeVisibleToSchema } from '../api/visibility'
import {
  createCollectionRecord,
  findInCollection,
  updateCollectionRecord,
} from './common'
import { UnifiedCompanyFields } from '@integration-app/sdk/udm/companies'
import users from './users'

const RECORD_KEY = 'organizations'

const handler: DataCollectionHandler = {
  name: 'Organizations',
  uri: '/data/collections/organizations',
  fieldsSchema: getFieldsSchema,
  parseUnifiedFields: {
    'crm-companies': parseUnifiedFields,
  },
  extractUnifiedFields: {
    'crm-companies': extractUnifiedFields,
  },
  find: (request) =>
    findInCollection({
      recordKey: RECORD_KEY,
      ...request,
    }),
  create: async (request) =>
    createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
  update: async (request) =>
    updateCollectionRecord({
      recordKey: RECORD_KEY,
      ...request,
    }),
}

export default handler

async function getFieldsSchema({}) {
  const type = Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: Type.String({
        title: 'Owner',
        referenceCollectionUri: users.uri,
      }),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['name']
  return type
}

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
