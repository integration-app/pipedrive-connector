import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makeLeadLabelSchema } from '../api/lead-labels'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeOwnerSchema } from '../api/users'
import {
  findInCollection,
  findOneInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import {
  UnifiedLeadFields,
  UnifiedLeadQuery,
} from '@integration-app/sdk/udm/crm-leads'

const RECORD_KEY = 'leads'
const SEARCH_ITEM_TYPE = 'lead'
const SEARCH_FIELDS = [
  'custom_fields',
  'notes',
  'email',
  'organization_name',
  'person_name',
  'phone',
  'title',
]

const handler: DataCollectionHandler = {
  name: 'Leads',
  find: {
    querySchema: getFindQuerySchema,
    execute: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-leads': parseUnifiedQuery,
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
      'crm-leads': parseUnifiedQuery,
    },
  },
  create: {
    execute: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-leads': parseUnifiedFields,
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
      'crm-leads': parseUnifiedFields,
    },
  },
}

export default handler

export async function getFindQuerySchema({ credentials }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'leads'),
    Type.Object(
      {
        user_id: await makeOwnerSchema(credentials),
      },
      {
        title: 'Filter by Field',
      },
    ),
  ])
}

export async function getFindOneQuerySchema({}) {
  return makeSearchQuerySchema(SEARCH_FIELDS)
}

export async function getFieldsSchema({ credentials }) {
  const type = Type.Partial(
    Type.Object({
      title: Type.String(),
      owner_id: await makeOwnerSchema(credentials),
      label_ids: Type.Array(await makeLeadLabelSchema({ credentials }), {
        title: 'Labels',
      }),
      person_id: Type.Integer({
        lookupCollectionUri: 'data/collections/persons',
      }),
      organization_id: Type.Integer({
        lookupCollectionUri: 'data/collections/organizations',
      }),
      expected_close_date: Type.String({
        format: 'date',
        title: 'Expected Close Date',
      }),
    }),
  )
  type.required = ['title']
  return type
}

async function parseUnifiedQuery({ unifiedQuery }) {
  const leadsQuery = unifiedQuery as UnifiedLeadQuery
  if (leadsQuery.email) {
    return {
      query: {
        search: {
          fields: ['email'],
          term: leadsQuery.email,
        },
      },
    }
  }
  return null
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedLead: UnifiedLeadFields = unifiedFields
  return {
    fields: {
      title: `${unifiedLead.firstName ?? ''} ${unifiedLead.lastName ?? ''}`,
      organization_id: unifiedLead.companyId,
    },
  }
}
