import { DataDirectoryListArgs } from '@integration-app/connector-sdk'
import {
  DataDirectoryListResponse,
  DataLocationType,
} from '@integration-app/sdk'

export default async function list(
  args: DataDirectoryListArgs,
): Promise<DataDirectoryListResponse> {
  return {
    locations: await args.apiClient.get('activityTypes').then((response) => {
      return response.data.map((type) => ({
        type: DataLocationType.collection,
        path: '/data/activities?type=' + type.key_string,
        name: type.name,
      }))
    }),
  }
}
