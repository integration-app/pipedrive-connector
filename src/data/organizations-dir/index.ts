import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Organizations',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        uri: '/data/organizations',
        name: 'All Organizations',
        isDefault: true,
      },
      {
        type: DataLocationType.directory,
        uri: '/data/organization-filters',
        name: 'Organization Filters',
      },
    ],
  }),
})

export default handler
