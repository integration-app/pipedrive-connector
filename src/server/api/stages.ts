import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeStageSchema(credentials) {
  const items = await getStages(credentials)
  return Type.String({
    title: 'Stage',
    referenceRecords: items.map((item) => ({
      id: item.id.toString(),
      name: item.name,
    })),
  })
}

export async function getStages(credentials) {
  const response = await get(credentials, 'stages')
  return response.data
}
