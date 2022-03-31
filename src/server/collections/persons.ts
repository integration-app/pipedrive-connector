import { DataCollectionHandler } from '@integration-app/connector-sdk'
import {
  UnifiedContactQuery,
  UnifiedContactFields,
} from '@integration-app/sdk/udm/crm-contacts'
import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeVisibleToSchema } from '../api/visibility'
import {
  findInCollection,
  findOneInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'
import users from './users'

const RECORD_KEY = 'persons'
const SEARCH_ITEM_TYPE = 'person'
const SEARCH_FIELDS = ['custom_fields', 'email', 'name', 'notes', 'phone']

const handler: DataCollectionHandler = {
  name: 'Persons',
  uri: '/data/collections/persons',
  find: {
    querySchema: getFindQuerySchema,
    execute: (request) =>
      findInCollection({
        recordKey: RECORD_KEY,
        searchItemType: SEARCH_ITEM_TYPE,
        ...request,
      }),
    parseUnifiedQuery: {
      'crm-contacts': parseFindUnifiedQuery,
    },
    extractUnifiedFields: {
      'crm-contacts': extractUnifiedFields,
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
      'crm-contacts': parseFindOneUnifiedQuery,
    },
    extractUnifiedFields: {
      'crm-contacts': extractUnifiedFields,
    },
  },
  create: {
    execute: async (request) =>
      createCollectionRecord({ recordKey: RECORD_KEY, ...request }),
    fieldsSchema: getCreateFieldsSchema,
    parseUnifiedFields: {
      'crm-contacts': parseUnifiedFields,
    },
  },
  update: {
    execute: async (request) =>
      updateCollectionRecord({
        recordKey: RECORD_KEY,
        ...request,
      }),
    fieldsSchema: getUpdateFieldsSchema,
    parseUnifiedFields: {
      'crm-contacts': parseUnifiedFields,
    },
  },
}

export default handler

async function getFindQuerySchema({ credentials }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'people'),
    Type.String({
      title: 'Owner',
      referenceCollectionUri: users.uri,
    }),
  ])
}

function getFindOneQuerySchema({}) {
  return makeSearchQuerySchema(SEARCH_FIELDS)
}

async function getCreateFieldsSchema({}) {
  const schema = await getCommonFieldsSchema()
  schema.required = ['name']
  return schema
}

async function getUpdateFieldsSchema() {
  return getCommonFieldsSchema()
}

async function getCommonFieldsSchema() {
  return Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: Type.String({
        title: 'Owner',
        referenceCollectionUri: users.uri,
      }),
      org_id: Type.Integer({
        referenceCollectionUri: 'data/collections/organizations',
      }),
      email: Type.Array(Type.String(), { title: 'Email(s)' }),
      phone: Type.Array(Type.String(), { title: 'Phone(s)' }),
      visible_to: await makeVisibleToSchema(),
      marketing_status: Type.String({
        title: 'Marketing Status',
        enum: ['no_consent', 'unsubscribed', 'subscribed', 'archived'],
      }),
    }),
  )
}

async function parseFindOneUnifiedQuery({ unifiedQuery }) {
  const contactsQuery = unifiedQuery as UnifiedContactQuery
  if (contactsQuery.email) {
    return {
      query: {
        search: {
          fields: ['email'],
          term: contactsQuery.email,
        },
      },
    }
  }
  return null
}

async function parseFindUnifiedQuery({ unifiedQuery }) {
  const contactsQuery = unifiedQuery as UnifiedContactQuery
  if (contactsQuery.email) {
    return {
      query: {
        $anyOfOption: {
          index: 0,
          value: {
            search: {
              fields: ['email'],
              term: contactsQuery.email,
            },
          },
        },
      },
    }
  }
  return null
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
      email: [unifiedFields.email],
      org_id: unifiedContact.companyId,
      owner_id: unifiedContact.userId,
    },
  }
}
