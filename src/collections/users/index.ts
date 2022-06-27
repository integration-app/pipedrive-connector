import { DataCollectionHandler } from '@integration-app/connector-sdk'
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
    lookupFields: ['email', 'name'],
    eventObject: 'user',
    udm: 'users',
  }),
  lookup: lookupUsers,
}

export default users

export const USER_SCHEMA = Type.String({
  title: 'User',
  referenceCollectionUri: users.uri,
})

async function lookupUsers({ apiClient, fields }) {
  if (fields.email) {
    return getRecords({
      path: 'users/find',
      apiClient,
      query: {
        term: fields.email,
        search_by: 'email',
      },
    })
  } else if (fields.name) {
    return getRecords({
      path: 'users/find',
      apiClient,
      query: {
        term: fields.name,
        search_by: 'name',
      },
    })
  } else {
    throw new Error('Lookup fields were not provided')
  }
}
