import { Type } from '@sinclair/typebox'

export async function makeActivityTypeSchema(apiClient) {
  const activityTypes = await getActivityTypes(apiClient)
  return Type.String({
    title: 'Activity Type',
    referenceRecords: activityTypes.map((item) => ({
      id: item.key_string,
      name: item.name,
    })),
  })
}

export async function getActivityTypes(apiClient) {
  const response = await apiClient.get('activityTypes')
  return response.data
}
