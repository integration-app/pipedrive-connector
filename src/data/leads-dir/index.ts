import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Leads',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        path: '/data/leads',
        name: 'All Leads',
        isDefault: true,
      },
      {
        type: DataLocationType.directory,
        path: '/data/lead-filters',
        name: 'Lead Filters',
      },
    ],
  }),
})

export default handler
