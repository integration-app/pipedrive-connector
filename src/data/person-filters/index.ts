import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'
import { getFilters } from '../../api/filters'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Person Filters',
  }),

  list: async ({ apiClient }) => ({
    locations: (await getFilters(apiClient, 'people')).map((filter) => ({
      type: DataLocationType.collection,
      path: '/data/persons?filter_id=' + filter.id,
      name: filter.name,
    })),
  }),
})

export default handler
