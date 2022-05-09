import { DataLocationType } from '@integration-app/sdk/connector-api'
import activities from './activities'
import deals from './deals'
import leads from './leads'
import organizations from './organizations'
import persons from './persons'
import users from './users'

export default {
  name: 'All Data',
  uri: 'data/root',
  list: async () => {
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
      uri: collection.uri,
      name: collection.name,
    }))
    return { locations }
  },
}
