import { DataLocationType } from '@integration-app/sdk/connector-api'
import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { getFilters } from '../../api/filters'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Activity Filters',
  }),

  list: async ({ apiClient }) => ({
    locations: (await getFilters(apiClient, 'activity')).map((filter) => ({
      type: DataLocationType.collection,
      path: '/data/activities?filter_id=' + filter.id,
      name: filter.name,
    })),
  }),
})

export default handler
