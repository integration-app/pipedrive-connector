import { FindByIdArgs } from '@integration-app/connector-sdk'
import { DataCollectionFindByIdResponse } from '@integration-app/sdk'

export default async function findById(
  args: FindByIdArgs,
): Promise<DataCollectionFindByIdResponse> {
  const { apiClient, parameters, recordFromApi, id } = args

  const response = await apiClient.get(`${parameters.path}/${id}`)

  return {
    record: await recordFromApi(response?.data),
  }
}
