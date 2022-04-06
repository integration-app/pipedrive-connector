import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
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
import users from './users'

const RECORD_KEY = 'organizations'
const SEARCH_ITEM_TYPE = 'organization'
const SEARCH_FIELDS = ['address', 'custom_fields', 'name', 'notes']

const handler: DataCollectionHandler = {
  name: 'Organizations',
  uri: '/data/collections/organizations',
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
    extractUnifiedFields: {
      'crm-companies': extractUnifiedFields,
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
    extractUnifiedFields: {
      'crm-companies': extractUnifiedFields,
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

export async function getFindQuerySchema({ apiClient }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(apiClient, 'org'),
    Type.String({
      title: 'Owner',
      referenceCollectionUri: users.uri,
    }),
  ])
}

export async function getFindOneQuerySchema({}) {
  return makeSearchQuerySchema(SEARCH_FIELDS)
}

export async function getFieldsSchema({}) {
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
      owner_id: unifiedCompany.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    unifiedFields: {
      name: fields.name,
      userId: fields.owner_id?.id,
    },
  }
}
