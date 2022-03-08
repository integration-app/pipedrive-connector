import {
  DataCollectionInsertResponse,
  DataCollectionQueryResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/connector-api'
import { get, MAX_LIMIT, post, put } from '../api'

export async function queryRecords(
  credentials,
  recordKey,
  query,
  cursor = null,
): Promise<DataCollectionQueryResponse> {
  const limit = MAX_LIMIT
  const parameters = {
    ...(query ?? {}),
    start: cursor ?? '0',
    limit,
  }
  const response = await get(credentials, recordKey, parameters)
  const hasMore = response.additional_data?.pagination?.more_items_in_collection
  const nextCursor = hasMore ? (parseInt(cursor) ?? 0 + limit).toString() : null
  return {
    records:
      response.data?.map((item) => ({
        id: item.id,
        record: item,
      })) ?? [],
    cursor: nextCursor,
  }
}

export async function insertRecord(
  credentials,
  recordKey,
  record,
): Promise<DataCollectionInsertResponse> {
  const response = await post(credentials, recordKey, record)
  return {
    id: response.data.id,
  }
}

export async function updateRecord(
  credentials,
  recordKey,
  id,
  record,
): Promise<DataCollectionUpdateResponse> {
  const response = await put(credentials, `${recordKey}/${id}`, record)
  return {
    id: response.data.id,
  }
}
