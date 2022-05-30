import {
  DataDirectoryListResponse,
  DataLocationType,
} from '@integration-app/sdk/connector-api'
import activities from '../collections/activities'
import deals from '../collections/deals'
import leads from '../collections/leads'
import organizations from '../collections/organizations'
import persons from '../collections/persons'
import users from '../collections/users'

export default {
  name: 'All Data',
  uri: 'data/root',
  list: {
    handler: async (): Promise<DataDirectoryListResponse> => {
      const collections = [
        organizations,
        persons,
        deals,
        leads,
        activities,
        users,
      ]
      const locations = collections.map((collection) => ({
        type: DataLocationType.collection,
        uri: collection.uri as string,
        name: collection.name as string,
      }))
      return { locations }
    },
  },
}
