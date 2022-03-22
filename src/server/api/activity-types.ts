import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeActivityTypeSchema(credentials) {
  const activityTypes = await getActivityTypes(credentials)
  return Type.String({
    title: 'Activity Type',
    referenceRecords: activityTypes.map((item) => ({
      id: item.key_string,
      name: item.name,
    })),
  })
}

export async function getActivityTypes(credentials) {
  const response = await get(credentials, 'activityTypes')
  return response.data
}
