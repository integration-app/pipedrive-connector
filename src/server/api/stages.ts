import { Type } from '@sinclair/typebox'

export async function makeStageSchema(apiClient) {
  const items = await getStages(apiClient)
  return Type.String({
    title: 'Stage',
    referenceRecords: items.map((item) => ({
      id: item.id.toString(),
      name: item.name,
    })),
  })
}

export async function getStages(apiClient) {
  const response = await apiClient.get('stages')
  return response.data
}
