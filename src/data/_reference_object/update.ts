import { UpdateArgs } from '@integration-app/connector-sdk'
import { DataCollectionUpdateResponse } from '@integration-app/sdk/data-locations'

export default async function update(
  args: UpdateArgs,
): Promise<DataCollectionUpdateResponse> {
  const { apiClient, id, fields, fieldsToApi, parameters } = args

  // Leads, unlike other objects, require `PATCH` request instead of PUT
  // https://developers.pipedrive.com/docs/api/v1/Leads#updateLead
  const method = parameters.path === 'leads' ? 'patch' : 'put'
  const response = await apiClient[method](
    `${parameters.path}/${id}`,
    await fieldsToApi(fields),
  )

  return {
    id: response.data.id.toString(),
  }
}
