import { DataDirectoryHandler } from '@integration-app/connector-sdk'
import {
  DataDirectorySpec,
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
  path: 'data/root',

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
          uri: collection.path as string,
          name: spec.name as string,
        }
      }),
    )
    return { locations }
  },
} as DataDirectoryHandler

async function spec(): Promise<DataDirectorySpec> {
  return {
    type: DataLocationType.directory,
    name: 'All Data',
  }
}
