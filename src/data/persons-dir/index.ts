import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Persons',
  }),

  list: async () => {
    const locations = [
      {
        type: DataLocationType.collection,
        path: '/data/persons',
        name: 'All Persons',
        isDefault: true,
      },
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
    ]

    // todo: include filters dir in testing
    // note: skipping filters collection in dev env
    // until filters-aware tests are implemented
    if (process.env.NODE_ENV !== 'development') {
      locations.push({
        type: DataLocationType.directory,
        path: '/data/person-filters',
        name: 'Person Filters',
      })
    }

    return { locations }
  },
})

export default handler
