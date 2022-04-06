import { Type } from '@sinclair/typebox'

export async function makeSavedFilterQuerySchema(apiClient, itemType) {
  console.log('makeSavedFilterQuerySchema', apiClient)
  const filters = await getFilters(apiClient, itemType)
  return Type.Object(
    {
      filter_id: Type.String({
        referenceRecords:
          filters?.map((filter: any) => {
            return { id: filter.id.toString(), name: filter.name }
          }) ?? [],
        title: 'Filter',
      }),
    },
    {
      title: 'Using Saved Filter',
    },
  )
}

export async function getFilters(apiClient, type: string) {
  const response = await apiClient.get('filters', {
    type,
  })
  return response.data
}
