import { DataCollectionHandler } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { makePipelineSchema } from '../api/pipelines'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeStageSchema } from '../api/stages'
import { makeVisibleToSchema } from '../api/visibility'
import {
  findInCollection,
  findOneInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import {
  UnifiedDealFields,
  UnifiedDealQuery,
} from '@integration-app/sdk/udm/crm-deals'
import users from './users'

const RECORD_KEY = 'deals'
const SEARCH_ITEM_TYPE = 'deal'
const SEARCH_FIELDS = ['custom_fields', 'notes', 'title']

const handler: DataCollectionHandler = {
  name: 'Deals',
  uri: '/data/collections/deals',
  find: {
    querySchema: getFindQuerySchema,
    execute: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        searchItemType: SEARCH_ITEM_TYPE,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-deals': parseUnifiedQuery,
    },
    extractUnifiedFields: {
      'crm-deals': extractUnifiedFields,
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
      'crm-deals': parseUnifiedQuery,
    },
    extractUnifiedFields: {
      'crm-deals': extractUnifiedFields,
    },
  },
  create: {
    execute: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-deals': parseUnifiedFields,
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
      'crm-deals': parseUnifiedFields,
    },
  },
}

export default handler

export async function getFindQuerySchema({ credentials }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'deals'),
    Type.Object(
      {
        user_id: Type.String({
          title: 'User',
          referenceCollectionUri: users.uri,
        }),
        stage_id: await makeStageSchema(credentials),
        status: Type.String({
          title: 'Status',
          enum: ['open', 'won', 'lost'],
        }),
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
      value: Type.String(),
      currency: Type.String(),
      user_id: Type.String({
        title: 'User',
        referenceCollectionUri: users.uri,
      }),
      person_id: Type.Integer({
        title: 'Person',
        referenceCollectionUri: 'data/collections/persons',
      }),
      org_id: Type.Integer({
        title: 'Organization',
        referenceCollectionUri: 'data/collections/organizations',
      }),
      pipeline_id: await makePipelineSchema(credentials),
      stage_id: await makeStageSchema(credentials),
      status: Type.String({ enum: ['open', 'won', 'lost'] }),
      expected_close_date: Type.String({ format: 'date' }),
      probability: Type.Integer(),
      lost_reason: Type.String(),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['title']
  return type
}

async function parseUnifiedQuery({ unifiedQuery }) {
  const dealsQuery = unifiedQuery as UnifiedDealQuery
  if (dealsQuery.name) {
    return {
      query: {
        search: {
          fields: ['name'],
          term: dealsQuery.name,
        },
      },
    }
  } else {
    return null
  }
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedDeal: UnifiedDealFields = unifiedFields
  return {
    fields: {
      name: unifiedDeal.name,
      value: unifiedDeal.amount?.toString?.(),
      org_id: unifiedDeal.companyId,
      user_id: unifiedDeal.userId,
    },
  }
}

function extractUnifiedFields({ fields }) {
  return {
    unifiedFields: {
      name: fields.name,
      amount: fields.value ? parseFloat(fields.value) : null,
      companyId: fields.org_id,
      userId: fields.user_id?.id,
    },
  }
}
