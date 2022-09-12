import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Activities',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        path: '/data/activities',
        name: 'All Activities',
        isDefault: true,
      },
      {
        type: DataLocationType.directory,
        path: '/data/activity-filters',
        name: 'Activity Filters',
      },
    ],
  }),
})

export default handler
