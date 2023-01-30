import { DeleteArgs } from '@integration-app/connector-sdk'
import { DataCollectionDeleteResponse } from '@integration-app/sdk/data-locations'

export default async function del(
  args: DeleteArgs,
): Promise<DataCollectionDeleteResponse> {
  const { apiClient, id } = args

  await apiClient.delete(id)

  return {}
}
