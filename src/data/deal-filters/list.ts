import { DataDirectoryListArgs } from '@integration-app/connector-sdk'
import {
  DataDirectoryListResponse,
  DataLocationType,
} from '@integration-app/sdk'
import { getFilters } from '../../api/filters'

export default async function list(
  args: DataDirectoryListArgs,
): Promise<DataDirectoryListResponse> {
  const filters = await getFilters(args.apiClient, 'deals')
  console.log(filters)
  const locations = filters.map((filter) => ({
    type: DataLocationType.collection,
    path: '/data/deals?filter_id=' + filter.id,
    name: filter.name,
  }))
  return {
    locations,
  }
}
