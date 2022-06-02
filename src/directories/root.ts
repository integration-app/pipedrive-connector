import {
  DataDirectory,
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
  uri: 'data/root',

  spec,

  list: async (request): Promise<DataDirectoryListResponse> => {
    const collections = [
      organizations,
      persons,
      deals,
      leads,
      activities,
      users,
    ]
    const locations = await Promise.all(
      collections.map(async (collection) => {
        const spec =
          typeof collection.spec === 'function'
            ? await collection.spec(request)
            : collection.spec
        return {
          type: DataLocationType.collection,
          uri: collection.uri as string,
          name: spec.name as string,
        }
      }),
    )
    return { locations }
  },
}

async function spec(): Promise<DataDirectory> {
  return {
    type: DataLocationType.directory,
    name: 'All Data',
  }
}
