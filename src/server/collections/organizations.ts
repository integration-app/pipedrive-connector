import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeOwnerSchema } from '../api/users'
import { makeVisibleToSchema } from '../api/visibility'
import {
  createCollectionRecord,
  findInCollection,
  findOneInCollection,
  updateCollectionRecord,
} from './common'
import {
  UnifiedCompanyFields,
  UnifiedCompanyQuery,
} from '@integration-app/sdk/udm/crm-companies'

const RECORD_KEY = 'organizations'
const SEARCH_ITEM_TYPE = 'organization'
const SEARCH_FIELDS = ['address', 'custom_fields', 'name', 'notes']

const handler: DataCollectionHandler = {
  name: 'Organizations',
  find: {
    querySchema: getFindQuerySchema,
    execute: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        searchItemType: SEARCH_ITEM_TYPE,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-companies': parseUnifiedQuery,
    },
  },
  findOne: {
    querySchema: getFindOneQuerySchema,
    execute: (request) =>
      findOneInCollection({
        searchItemType: SEARCH_ITEM_TYPE,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-companies': parseUnifiedQuery,
    },
  },
  create: {
    execute: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-companies': parseUnifiedFields,
    },
  },
  update: {
    execute: async (request) =>
      updateCollectionRecord({
        recordKey: RECORD_KEY,
        ...request,
      }),
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-companies': parseUnifiedFields,
    },
  },
}

export default handler

export async function getFindQuerySchema({ credentials }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'org'),
    await makeOwnerSchema(credentials),
  ])
}

export async function getFindOneQuerySchema({}) {
  return makeSearchQuerySchema(SEARCH_FIELDS)
}

export async function getFieldsSchema({ credentials }) {
  const type = Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: await makeOwnerSchema(credentials),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['name']
  return type
}

async function parseUnifiedQuery({ unifiedQuery }) {
  const companiesQuery = unifiedQuery as UnifiedCompanyQuery
  if (companiesQuery.name) {
    return {
      query: {
        search: {
          fields: ['name'],
          term: companiesQuery.name,
        },
      },
    }
  }
  return null
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedCompany: UnifiedCompanyFields = unifiedFields
  return {
    fields: {
      name: unifiedCompany.name,
    },
  }
}
