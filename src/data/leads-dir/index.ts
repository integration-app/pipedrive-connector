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
        uri: '/data/leads',
        name: 'All Leads',
      },
      {
        type: DataLocationType.directory,
        uri: '/data/lead-filters',
        name: 'Lead Filters',
      },
    ],
  }),
})

export default handler
