import { CreateArgs } from '@integration-app/connector-sdk'
import { DataCollectionCreateResponse } from '@integration-app/sdk/data-locations'

export default async function create(
  args: CreateArgs,
): Promise<DataCollectionCreateResponse> {
  const { apiClient, fields, fieldsToApi, parameters } = args

  const response = await apiClient.post(
    parameters.path,
    await fieldsToApi(fields),
  )

  return {
    id: response.data.id.toString(),
  }
}
