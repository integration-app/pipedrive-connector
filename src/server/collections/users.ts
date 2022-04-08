import { Type } from '@sinclair/typebox'
import { getRecords } from '../api/records'
import { UnifiedUserQuery } from '@integration-app/sdk/udm/users'

export default {
  name: 'Users',
  uri: '/data/collections/users',

  find: {
    querySchema: Type.Object({
      term: Type.String({
        title: 'Search Term',
      }),
      search_by_email: Type.Number({
        title: 'Search By',
        referenceRecords: [
          {
            id: 1,
            name: 'Email',
          },
          {
            id: 0,
            name: 'Name',
          },
        ],
      }),
    }),
    execute: (request) =>
      getRecords({
        // If query is provided: https://developers.pipedrive.com/docs/api/v1/Users#findUsersByName
        // Otherwise: https://developers.pipedrive.com/docs/api/v1/Users#getUsers
        recordKey: request.query?.term ? 'users/find' : 'users',
        ...request,
      }),
    parseUnifiedQuery: {
      users: parseUnifiedQuery,
    },
    extractUnifiedFields: {
      users: extractUnifiedFields,
    },
  },
}

async function extractUnifiedFields({ fields }) {
  return {
    email: fields.email,
    name: fields.name,
  }
}

async function parseUnifiedQuery({
  unifiedQuery,
}: {
  unifiedQuery: UnifiedUserQuery
}) {
  if (unifiedQuery.email) {
    return {
      query: {
        term: unifiedQuery.email,
        search_by_email: 1,
      },
    }
  }
  return null
}
