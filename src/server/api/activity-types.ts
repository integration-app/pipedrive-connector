import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeActivityTypeSchema(credentials) {
  const users = await getActivityTypes(credentials)
  return Type.String({
    title: 'Activity Type',
    enum: users.map((item) => ({
      value: item.key_string,
      label: item.name,
    })),
  })
}

export async function getActivityTypes(credentials) {
  const response = await get(credentials, 'activityTypes')
  return response.data
}
