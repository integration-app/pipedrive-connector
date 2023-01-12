import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Notes and Activities',
  }),

  list: async () => ({
    locations: [
      {
        type: DataLocationType.collection,
        path: '/data/notes',
        name: 'Notes',
      },
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
      {
        type: DataLocationType.directory,
        path: '/data/activities-by-type',
        name: 'Activities By Type',
      },
    ],
  }),
})

export default handler
