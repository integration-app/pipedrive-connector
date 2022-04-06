import { Type } from '@sinclair/typebox'

export async function makePipelineSchema(apiClient) {
  const items = await getPipelines(apiClient)
  return Type.String({
    title: 'Pipeline',
    referenceRecords: items.map((item) => ({
      id: item.id.toString(),
      name: item.name,
    })),
  })
}

export async function getPipelines(apiClient) {
  const response = await apiClient.get('pipelines')
  return response.data
}
