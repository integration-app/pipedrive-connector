import {
  DataCollectionCreateResponse,
  DataCollectionFindByIdResponse,
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
  extractRecord = null,
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
    records: response.data
      ? response.data.map(extractRecord ?? defaultExtractRecord)
      : [],
    cursor: nextCursor,
  }
}

export async function findRecordById({
  apiClient,
  path,
  id,
  extractRecord = null,
}): Promise<DataCollectionFindByIdResponse> {
  const response = await apiClient.get(`${path}/${id}`)
  return {
    record: (extractRecord ?? defaultExtractRecord)(response),
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
  extractRecord = null,
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
      .map(extractRecord ?? defaultExtractRecord),
  }
}

export async function createRecord({
  apiClient,
  path,
  fields,
}): Promise<DataCollectionCreateResponse> {
  const response = await apiClient.post(path, fields)
  return {
    id: response.data.id.toString(),
  }
}

export async function updateRecord({
  path,
  apiClient,
  id,
  fields,
}): Promise<DataCollectionUpdateResponse> {
  const response = await apiClient.put(`${path}/${id}`, fields)
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
