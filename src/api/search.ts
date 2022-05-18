import { DataRecord } from '@integration-app/sdk/connector-api'
import { Type } from '@sinclair/typebox'
import { MAX_LIMIT } from '.'

/**
 * Create a query schema to search for records using itemSearch
 * https://developers.pipedrive.com/docs/api/v1/ItemSearch
 * @param searchFields
 * @returns
 */
export function makeSearchQuerySchema(searchFields: string[]) {
  return Type.Object(
    {
      search: Type.Object({
        fields: Type.Array(
          Type.String({
            enum: searchFields,
          }),
          { title: 'Fields to Search' },
        ),
        term: Type.String({ title: 'Search Term' }),
      }),
    },
    {
      title: 'Search by Fields',
    },
  )
}

export function isSearchQuery(query: any) {
  return query?.search?.term
}

/**
 * @param query - data matching the schema returned from makeSearchQuerySchema
 * @returns
 */
export async function search(
  apiClient,
  itemType,
  query,
): Promise<DataRecord[]> {
  const parameters = {
    term: query.search.term,
    item_types: itemType,
    search_for_related_items: false,
    limit: MAX_LIMIT,
  } as any

  if (query.search.fields.length > 0) {
    parameters.fields = query.search.fields.join(',')
  }

  const response = await apiClient.get('itemSearch', parameters)

  const records: DataRecord[] =
    response.data?.items?.map((responseRecord) => ({
      fields: responseRecord.item,
      id: responseRecord.item.id.toString(),
    })) ?? []

  return records
}
