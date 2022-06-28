import {
  ConnectorDataCollectionFindRequest,
  DataCollectionHandler,
} from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { getRecords } from '../../api/records'
import { objectCollectionHandler } from '../common'

const FIELDS = ['name', 'email', 'active_flag']

const users: DataCollectionHandler = {
  ...objectCollectionHandler({
    directory: __dirname,
    path: 'users',
    name: 'Users',
    createFields: FIELDS,
    requiredFields: FIELDS,
    updateFields: ['active_flag'],
    queryFields: ['email', 'name'],
    eventObject: 'user',
    udm: 'users',
  }),
  find: findUsers,
}

export default users

export const USER_SCHEMA = Type.String({
  title: 'User',
  referenceCollectionUri: users.uri,
})

async function findUsers(request: ConnectorDataCollectionFindRequest) {
  if (request.query) {
    return queryUsers({ ...request, query: request.query })
  } else {
    return getRecords({ ...request, path: 'users' })
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
