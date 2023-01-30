import { FindByIdArgs } from '@integration-app/connector-sdk'
import { DataCollectionFindByIdResponse } from '@integration-app/sdk'

export default async function findById(
  args: FindByIdArgs,
): Promise<DataCollectionFindByIdResponse> {
  const { apiClient, recordFromApi } = args
  const response = await apiClient.get('')

  return {
    record: await recordFromApi(response.record),
  }
}
