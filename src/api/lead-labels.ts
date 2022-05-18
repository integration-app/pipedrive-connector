import { Type } from '@sinclair/typebox'

export async function makeLeadLabelSchema(apiClient) {
  const items = await getLeadLabels(apiClient)
  return Type.String({
    title: 'Label',
    referenceRecords: items.map((item) => ({
      id: item.id.toString(),
      name: item.name,
    })),
  })
}

export async function getLeadLabels(apiClient) {
  const response = await apiClient.get('leadLabels')
  return response.data
}
