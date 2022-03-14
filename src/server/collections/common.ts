import {
  DataCollectionCreateResponse,
  DataCollectionFindOneResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/connector-api'
import { createRecord, getRecords, updateRecord } from '../api/records'
import { isSearchQuery, search } from '../api/search'

export async function findInCollection(
  collection,
  credentials,
  query: any,
  cursor?: string,
): Promise<DataCollectionFindResponse> {
  if (collection.searchItemType && isSearchQuery(query)) {
    const records = await search(credentials, collection.searchItemType, query)
    return {
      records,
    }
  } else {
    return getRecords(credentials, collection.key, query, cursor)
  }
}

export async function findOneInCollection(
  collection,
  credentials,
  query,
): Promise<DataCollectionFindOneResponse> {
  if (collection.searchItemType && isSearchQuery(query)) {
    const records = await search(credentials, collection.searchItemType, query)
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

export async function insertCollectionRecord(
  collection,
  credentials,
  record,
): Promise<DataCollectionCreateResponse> {
  return createRecord(credentials, collection.key, record)
}

export async function updateCollectionRecord(
  collection,
  credentials,
  id,
  record,
): Promise<DataCollectionUpdateResponse> {
  return updateRecord(credentials, collection.key, id, record)
}
