import {
  DataCollectionCreateResponse,
  DataCollectionFindByIdResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
  DataRecord,
} from '@integration-app/sdk/connector-api'
import { MAX_LIMIT } from '.'

export async function getRecords({
  apiClient,
  path,
  query = null,
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
  const nextCursor =
    response.additional_data?.pagination?.next_start?.toString()
  return {
    records: response.data
      ? await Promise.all(
          response.data.map(extractRecord ?? defaultExtractRecord),
        )
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
    record: await (extractRecord ?? defaultExtractRecord)(response.data),
  }
}

/**
 * @param query - data matching the schema returned from makeSearchQuerySchema
 * @returns
 */
export async function searchRecords({
  apiClient,
  path,
  query,
  extractRecord = null,
}): Promise<DataCollectionFindResponse> {
  const firstField = Object.entries(query ?? [])[0]
  let field = firstField?.[0]
  const term = firstField?.[1]

  if (!field || !term) {
    throw new Error('Query fields were not provided')
  }

  if (field?.startsWith('query_')) {
    field = field.replace('query_', '')
  }

  const parameters = {
    term,
    query: field,
  } as any

  const response = await apiClient.get(`${path}/search`, parameters)

  if (!response?.data?.items?.length) {
    return {
      records: [],
    }
  }

  return {
    records: await Promise.all(
      response.data.items
        .map((searchItem) => searchItem.item)
        .map(extractRecord ?? defaultExtractRecord),
    ),
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
  // Leads, unlike other objects, require `PATCH` request instead of PUT
  // https://developers.pipedrive.com/docs/api/v1/Leads#updateLead
  const method = path === 'leads' ? 'patch' : 'put'
  const response = await apiClient[method](`${path}/${id}`, fields)
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
