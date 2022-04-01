import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makePipelineSchema(credentials) {
  const items = await getPipelines(credentials)
  return Type.String({
    title: 'Pipeline',
    referenceRecords: items.map((item) => ({
      id: item.id.toString(),
      name: item.name,
    })),
  })
}

export async function getPipelines(credentials) {
  const response = await get(credentials, 'pipelines')
  return response.data
}
