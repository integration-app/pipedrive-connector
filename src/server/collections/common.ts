import {
  DataCollectionCreateResponse,
  DataCollectionFindOneResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/connector-api'
import { createRecord, getRecords, updateRecord } from '../api/records'
import { isSearchQuery, search } from '../api/search'

export async function findInCollection({
  credentials,
  recordKey,
  searchItemType = null,
  query = null,
  cursor = null,
}): Promise<DataCollectionFindResponse> {
  if (searchItemType && isSearchQuery(query)) {
    const records = await search(credentials, searchItemType, query)
    return {
      records,
    }
  } else {
    return getRecords({ credentials, recordKey, query, cursor })
  }
}

export async function findOneInCollection({
  credentials,
  searchItemType,
  query = null,
}): Promise<DataCollectionFindOneResponse> {
  if (searchItemType && isSearchQuery(query)) {
    const records = await search(credentials, searchItemType, query)
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
  credentials,
  fields,
}): Promise<DataCollectionCreateResponse> {
  return createRecord(credentials, recordKey, fields)
}

export async function updateCollectionRecord({
  recordKey,
  credentials,
  id,
  fields,
}): Promise<DataCollectionUpdateResponse> {
  return updateRecord(credentials, recordKey, id, fields)
}
