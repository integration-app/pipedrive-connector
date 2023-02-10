import { DeleteArgs } from '@integration-app/connector-sdk'
import { DataCollectionDeleteResponse } from '@integration-app/sdk/data-locations'

export default async function del(
  args: DeleteArgs,
): Promise<DataCollectionDeleteResponse> {
  const { apiClient, id, parameters } = args

  await apiClient.delete(`${parameters.path}/${id}`)

  return {}
}
