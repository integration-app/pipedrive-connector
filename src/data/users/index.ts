import { DataCollectionHandler, FindArgs } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { getRecords } from '../../api/records'
import { objectCollectionHandler } from '../common'

const FIELDS = ['name', 'email', 'active_flag']

const users = new DataCollectionHandler({
  ...objectCollectionHandler({
    ymlDir: __dirname,
    path: 'users',
    name: 'Users',
    requiredFields: FIELDS,
    queryFields: ['email', 'name'],
    eventObject: 'user',
  }),
  find: findUsers,
})

export default users

export const USER_SCHEMA = Type.String({
  title: 'User',
  referenceCollectionPath: users.path,
})

async function findUsers(request: FindArgs) {
  if (request.query) {
    return queryUsers({ ...request, query: request.query })
  } else {
    const result = await getRecords({ ...request, path: 'users' })
    // Pipedrive doesn't work well with inactive users, so it's better to pretend they don't exist.
    // For example, it doesn't allow searching inactive users, and doens't allow assigning them to many fields.
    result.records = result.records.filter(
      (record) => record.fields.active_flag,
    )
    return result
  }
}

async function queryUsers({ apiClient, query }) {
  if (query.email) {
    return getRecords({
      path: 'users/find',
      apiClient,
      query: {
        term: query.email,
        search_by_email: 1,
      },
    })
  } else if (query.name) {
    return getRecords({
      path: 'users/find',
      apiClient,
      query: {
        term: query.name,
        search_by_email: 0,
      },
    })
  } else {
    throw new Error('Query fields were not provided')
  }
}
