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
    return {
      locations: [
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
      ],
    }
  },
})
