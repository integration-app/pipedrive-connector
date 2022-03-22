import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeLeadLabelSchema(credentials) {
  const items = await getLeadLabels(credentials)
  return Type.String({
    title: 'Label',
    referenceRecords: items.map((item) => ({
      id: item.id,
      name: item.name,
    })),
  })
}

export async function getLeadLabels(credentials) {
  const response = await get(credentials, 'leadLabels')
  return response.data
}
