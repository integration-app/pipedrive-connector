import {
  DataCollectionCreateResponse,
  DataCollectionFindByIdResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk'
import { DataRecord } from '@integration-app/sdk/data-collections'
import { MAX_LIMIT } from '.'

export async function getRecords({
  apiClient,
  path,
  parameters = null,
  query = null,
  cursor = null,
  extractRecord = null,
  activeOnly = false,
}) {
  const limit = MAX_LIMIT
  const params = {
    ...(query ?? {}),
    start: cursor ?? '0',
    ...(parameters?.filter_id ? { filter_id: parameters.filter_id } : {}),
    ...(parameters?.type ? { type: parameters?.type } : {}),
    limit,
  }
  const response = await apiClient.get(path, params)

  const nextCursor =
    response.additional_data?.pagination?.next_start?.toString()

  let records = response.data ?? []

  if (activeOnly) {
    records = records.filter((record) => record.active_flag)
  }

  records = await Promise.all(
    records.map(extractRecord ?? defaultExtractRecord),
  )

  return {
    records,
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
  const field = firstField?.[0]
  const term = firstField?.[1]

  if (!field || !term) {
    throw new Error('Query fields were not provided')
  }

  const parameters = {
    term,
    fields: field,
    exact_match: true,
  } as any

  const response = await apiClient.get(`${path}/search`, parameters)

  if (!response?.data?.items?.length) {
    return {
      records: [],
    }
  }

  const result = {
    records: await Promise.all(
      response.data.items
        .map((searchItem) => searchItem.item)
        .map(extractRecord ?? defaultExtractRecord),
    ),
  }

  return result
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
export async function defaultExtractRecord(item): Promise<DataRecord> {
  return {
    id: item.id.toString(),
    name: item.name,
    fields: item,
  }
}
