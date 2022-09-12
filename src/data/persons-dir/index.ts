import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Persons',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        uri: '/data/persons',
        name: 'All Persons',
        isDefault: true,
      },
      {
        type: DataLocationType.directory,
        uri: '/data/person-filters',
        name: 'Person Filters',
      },
    ],
  }),
})

export default handler
