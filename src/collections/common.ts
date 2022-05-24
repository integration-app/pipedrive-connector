import {
  DataCollectionCreateResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/connector-api'
import { createRecord, getRecords, updateRecord } from '../api/records'

export async function findInCollection({
  apiClient,
  path,
  query = null,
  cursor = null,
}): Promise<DataCollectionFindResponse> {
  return getRecords({ apiClient, path, query, cursor })
}

export async function createCollectionRecord({
  path,
  apiClient,
  fields,
}): Promise<DataCollectionCreateResponse> {
  return createRecord(apiClient, path, fields)
}

export async function updateCollectionRecord({
  path,
  apiClient,
  id,
  fields,
}): Promise<DataCollectionUpdateResponse> {
  return updateRecord(apiClient, path, id, fields)
}
