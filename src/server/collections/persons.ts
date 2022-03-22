import { DataCollectionHandler } from '@integration-app/connector-sdk'
import {
  UnifiedContactQuery,
  UnifiedContactFields,
} from '@integration-app/sdk/udm/crm-contacts'
import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeOwnerSchema } from '../api/users'
import { makeVisibleToSchema } from '../api/visibility'
import {
  findInCollection,
  findOneInCollection,
  createCollectionRecord,
  updateCollectionRecord,
} from './common'

const RECORD_KEY = 'persons'
const SEARCH_ITEM_TYPE = 'person'
const SEARCH_FIELDS = ['custom_fields', 'email', 'name', 'notes', 'phone']

const handler: DataCollectionHandler = {
  name: 'Persons',
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
    fieldsSchema: getFieldsSchema,
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
    fieldsSchema: getFieldsSchema,
    parseUnifiedFields: {
      'crm-contacts': parseUnifiedFields,
    },
  },
}

export default handler

export async function getFindQuerySchema({ credentials }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'people'),
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
      org_id: Type.Integer({
        lookupCollectionUri: 'data/collections/organizations',
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
  type.required = ['name']
  return type
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
    firstName: fields.name ? fields.name.split(' ')[0] : undefined,
    lastName: fields.name ? fields.name.split(' ')[1] : undefined,
    email: fields.email?.[0]?.value,
    companyId: fields.org_id,
    companyName: fields.org_name,
  }
}

async function parseUnifiedFields({ unifiedFields }) {
  const unifiedContact: UnifiedContactFields = unifiedFields
  return {
    fields: {
      name: `${unifiedContact.firstName ?? ''} ${
        unifiedContact.lastName ?? ''
      }`,
      email: [unifiedFields.email],
      // ToDo: the rest of fields
    },
  }
}
