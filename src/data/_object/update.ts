import { UpdateArgs } from '@integration-app/connector-sdk'
import { DataCollectionUpdateResponse } from '@integration-app/sdk/data-locations'

export default async function update(
  args: UpdateArgs,
): Promise<DataCollectionUpdateResponse> {
  const { apiClient, id, fields, fieldsToApi } = args

  await apiClient.put(`object/${id}`, await fieldsToApi(fields))

  return {
    id,
  }
}
