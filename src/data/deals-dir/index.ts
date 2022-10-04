import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Deals',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        path: '/data/deals',
        name: 'All Deals',
        isDefault: true,
      },
      {
        type: DataLocationType.directory,
        path: '/data/deal-filters',
        name: 'Deal Filters',
      },
    ],
  }),
})

export default handler
