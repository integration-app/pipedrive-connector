import {
  ConnectorDataCollectionFindRequest,
  DataCollectionHandler,
} from '@integration-app/connector-sdk'
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

async function findUsers(request: ConnectorDataCollectionFindRequest) {
  if (request.query) {
    return queryUsers({ ...request, query: request.query })
  } else {
    const result = await getRecords({ ...request, path: 'users' })
    if (request.parameters.active) {
      result.records = result.records.filter(
        (record) => record.fields.active_flag,
      )
    }
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
        query_by: 'email',
      },
    })
  } else if (query.name) {
    return getRecords({
      path: 'users/find',
      apiClient,
      query: {
        term: query.name,
        query_by: 'name',
      },
    })
  } else {
    throw new Error('Query fields were not provided')
  }
}
