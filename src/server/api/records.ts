import {
  DataCollectionCreateResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/connector-api'
import { MAX_LIMIT } from '.'

export async function getRecords({
  apiClient,
  recordKey,
  query,
  cursor = null,
  parseRecord = defaultParseRecord,
}): Promise<DataCollectionFindResponse> {
  const limit = MAX_LIMIT
  const parameters = {
    ...(query ?? {}),
    start: cursor ?? '0',
    limit,
  }
  const response = await apiClient.get(recordKey, parameters)
  const hasMore = response.additional_data?.pagination?.more_items_in_collection
  const nextCursor = hasMore ? (parseInt(cursor) ?? 0 + limit).toString() : null
  return {
    records: response.data?.map(parseRecord) ?? [],
    cursor: nextCursor,
  }
}

function defaultParseRecord(fields) {
  return {
    id: fields.id.toString(),
    name: fields.name,
    fields,
  }
}

export async function createRecord(
  apiClient,
  recordKey,
  record,
): Promise<DataCollectionCreateResponse> {
  const response = await apiClient.post(recordKey, record)
  return {
    id: response.data.id.toString(),
  }
}

export async function updateRecord(
  apiClient,
  recordKey,
  id,
  fields,
): Promise<DataCollectionUpdateResponse> {
  const response = await apiClient.put(`${recordKey}/${id}`, fields)
  return {
    id: response.data.id.toString(),
  }
}
