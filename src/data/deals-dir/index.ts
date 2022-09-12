import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Contacts',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        uri: '/data/deals',
        name: 'All Deals',
        isDefault: true,
      },
      {
        type: DataLocationType.directory,
        uri: '/data/deal-filters',
        name: 'Deal Filters',
      },
    ],
  }),
})

export default handler
