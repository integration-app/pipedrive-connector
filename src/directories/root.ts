import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import {
  DataDirectorySpec,
  DataDirectoryListResponse,
  DataLocationType,
} from '@integration-app/sdk/connector-api'
import activities from '../collections/activities'
import deals from '../collections/deals'
import leads from '../collections/leads'
import organizations from '../collections/organizations'
import persons from '../collections/persons'
import users from '../collections/users'

export default {
  path: 'data/root',

  spec,

  list: async (): Promise<DataDirectoryListResponse> => {
    const collections = [
      {
        name: 'Organizations',
        path: organizations.path,
      },
      {
        name: 'Persons',
        path: persons.path,
      },
      {
        name: 'Deals',
        path: deals.path,
      },
      {
        name: 'Leads',
        path: leads.path,
      },
      {
        name: 'Activities',
        path: activities.path,
      },
      {
        name: 'Users',
        path: users.path,
      },
    ]
    const locations = await Promise.all(
      collections.map(async (collection) => {
        return {
          type: DataLocationType.collection,
          uri: collection.path as string,
          name: collection.name as string,
        }
      }),
    )
    return { locations }
  },
} as DataDirectoryHandler

async function spec(): Promise<DataDirectorySpec> {
  return {
    type: DataLocationType.directory,
    name: 'Pipedrive',
  }
}
