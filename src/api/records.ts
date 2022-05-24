import {
  DataCollectionCreateResponse,
  DataCollectionFindResponse,
  DataCollectionLookupResponse,
  DataCollectionUpdateResponse,
  DataRecord,
} from '@integration-app/sdk/connector-api'
import { MAX_LIMIT } from '.'

export async function getRecords({
  apiClient,
  path,
  query,
  cursor = null,
  extractRecord = defaultExtractRecord,
}): Promise<DataCollectionFindResponse> {
  const limit = MAX_LIMIT
  const parameters = {
    ...(query ?? {}),
    start: cursor ?? '0',
    limit,
  }
  const response = await apiClient.get(path, parameters)
  const hasMore = response.additional_data?.pagination?.more_items_in_collection
  const nextCursor = hasMore ? (parseInt(cursor) ?? 0 + limit).toString() : null
  return {
    records: response.data ? response.data.map(extractRecord) : [],
    cursor: nextCursor,
  }
}

/**
 * @param query - data matching the schema returned from makeSearchQuerySchema
 * @returns
 */
export async function lookupRecords({
  apiClient,
  path,
  fields,
  extractRecord = defaultExtractRecord,
}): Promise<DataCollectionLookupResponse> {
  const [field, term] = Object.entries(fields ?? [])[0]

  if (!fields || !term) {
    throw new Error('Lookup fields were not provided')
  }

  const parameters = {
    term,
    fields: field,
  } as any

  const response = await apiClient.get(`${path}/search`, parameters)

  if (!response?.data?.items?.length) {
    return {
      records: [],
    }
  }

  return {
    records: response.data.items
      .map((searchItem) => searchItem.item)
      .map(extractRecord),
  }
}

export async function createRecord(
  apiClient,
  objectKey,
  record,
): Promise<DataCollectionCreateResponse> {
  const response = await apiClient.post(objectKey, record)
  return {
    id: response.data.id.toString(),
  }
}

export async function updateRecord(
  apiClient,
  objectKey,
  id,
  fields,
): Promise<DataCollectionUpdateResponse> {
  const response = await apiClient.put(`${objectKey}/${id}`, fields)
  return {
    id: response.data.id.toString(),
  }
}

/**
 * Extract a record from an item from the API response.
 */
export function defaultExtractRecord(item): DataRecord {
  return {
    id: item.id.toString(),
    name: item.name,
    fields: item,
  }
}
