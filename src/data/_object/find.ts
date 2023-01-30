import { FindArgs } from '@integration-app/connector-sdk'
import { DataCollectionFindResponse } from '@integration-app/sdk'

export default async function find(
  args: FindArgs,
): Promise<DataCollectionFindResponse> {
  const { apiClient, recordFromApi } = args
  const response = await apiClient.get('')

  const records = await Promise.all(response.records.map(recordFromApi))

  return {
    records,
    cursor: null,
  }
}
