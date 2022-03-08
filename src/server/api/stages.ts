import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeStageSchema(credentials) {
  const users = await getStages(credentials)
  return Type.String({
    title: 'Stage',
    enum: users.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  })
}

export async function getStages(credentials) {
  const response = await get(credentials, 'stages')
  return response.data
}
