import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeSavedFilterQuerySchema(credentials, itemType) {
  const filters = await getFilters(credentials, itemType)
  return Type.Object(
    {
      filter_id: Type.String({
        enum: filters.map((filter: any) => {
          return { value: filter.id, label: filter.name }
        }),
        title: 'Filter',
      }),
    },
    {
      title: 'Using Saved Filter',
    },
  )
}

export async function getFilters(credentials, type: string) {
  const response = await get(credentials, 'filters', {
    type,
  })
  return response.data
}
