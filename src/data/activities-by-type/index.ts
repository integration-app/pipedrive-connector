import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import { DataLocationType } from '@integration-app/sdk/connector-api'

const handler = new DataDirectoryHandler({
  spec: async () => ({
    type: DataLocationType.directory,
    name: 'Activities By Type',
  }),

  list: async ({ apiClient }) => ({
    locations: await apiClient.get('activityTypes').then((response) => {
      return response.data.map((type) => ({
        type: DataLocationType.collection,
        path: '/data/activities?type=' + type.key_string,
        name: type.name,
      }))
    }),
  }),
})

export default handler
