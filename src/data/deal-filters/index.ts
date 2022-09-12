import { DataLocationType } from '@integration-app/sdk/connector-api'
import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { getFilters } from '../../api/filters'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Deal Filters',
  }),

  list: async ({ apiClient }) => ({
    locations: (await getFilters(apiClient, 'deals')).map((filter) => ({
      type: DataLocationType.collection,
      uri: '/data/deals?filter_id=' + filter.id,
      name: filter.name,
    })),
  }),
})

export default handler
