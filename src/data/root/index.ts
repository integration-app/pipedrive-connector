import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import {
  DataDirectorySpec,
  DataDirectoryListResponse,
  DataLocationType,
} from '@integration-app/sdk/connector-api'

export default new DataDirectoryHandler({
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
        path: '/data/organizations-dir',
      },
      {
        name: 'Persons',
        path: '/data/persons-dir',
      },
      {
        name: 'Deals',
        path: '/data/deals-dir',
      },
      {
        name: 'Leads',
        path: '/data/leads-dir',
      },
      {
        name: 'Activities',
        path: '/data/activities-dir',
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
