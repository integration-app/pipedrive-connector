import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeLeadLabelSchema(credentials) {
  const users = await getLeadLabels(credentials)
  return Type.String({
    title: 'Label',
    enum: users.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  })
}

export async function getLeadLabels(credentials) {
  const response = await get(credentials, 'leadLabels')
  return response.data
}
