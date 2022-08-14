import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import {
  DataDirectorySpec,
  DataDirectoryListResponse,
  DataLocationType,
} from '@integration-app/sdk/connector-api'

export default new DataDirectoryHandler({
  path: 'data/root',

  async spec(): Promise<DataDirectorySpec> {
    return {
      type: DataLocationType.directory,
      name: 'Pipedrive',
    }
  },

  list: async (): Promise<DataDirectoryListResponse> => {
    const collections = [
      {
        name: 'Organizations',
        path: '/data/organizations',
      },
      {
        name: 'Persons',
        path: '/data/persons',
      },
      {
        name: 'Deals',
        path: '/data/deals',
      },
      {
        name: 'Leads',
        path: '/data/leads',
      },
      {
        name: 'Activities',
        path: '/data/activities',
      },
      {
        name: 'Users',
        path: '/data/users',
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
})
