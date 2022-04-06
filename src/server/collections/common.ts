import {
  DataCollectionCreateResponse,
  DataCollectionFindOneResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/connector-api'
import { createRecord, getRecords, updateRecord } from '../api/records'
import { isSearchQuery, search } from '../api/search'

export async function findInCollection({
  apiClient,
  recordKey,
  searchItemType = null,
  query = null,
  cursor = null,
}): Promise<DataCollectionFindResponse> {
  if (searchItemType && isSearchQuery(query)) {
    const records = await search(apiClient, searchItemType, query)
    return {
      records,
    }
  } else {
    return getRecords({ apiClient, recordKey, query, cursor })
  }
}

export async function findOneInCollection({
  apiClient,
  searchItemType,
  query = null,
}): Promise<DataCollectionFindOneResponse> {
  if (searchItemType && isSearchQuery(query)) {
    const records = await search(apiClient, searchItemType, query)
    return {
      record: records[0],
      multipleResults: records.length > 1,
    }
  } else {
    return {
      record: null,
      multipleResults: false,
    }
  }
}

export async function createCollectionRecord({
  recordKey,
  apiClient,
  fields,
}): Promise<DataCollectionCreateResponse> {
  return createRecord(apiClient, recordKey, fields)
}

export async function updateCollectionRecord({
  recordKey,
  apiClient,
  id,
  fields,
}): Promise<DataCollectionUpdateResponse> {
  return updateRecord(apiClient, recordKey, id, fields)
}
