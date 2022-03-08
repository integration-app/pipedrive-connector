import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makePipelineSchema(credentials) {
  const users = await getPipelines(credentials)
  return Type.String({
    title: 'Pipeline',
    enum: users.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  })
}

export async function getPipelines(credentials) {
  const response = await get(credentials, 'pipelines')
  return response.data
}
