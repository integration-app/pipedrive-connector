import {
  ConnectorDataCollectionFindOneRequest,
  ConnectorDataCollectionFindRequest,
  ConnectorDataCollectionUpdateRequest,
} from '@integration-app/connector-sdk'
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
  request: ConnectorDataCollectionFindRequest,
): Promise<DataCollectionFindResponse> {
  if (collection.searchItemType && isSearchQuery(request.query)) {
    const records = await search(
      request.credentials,
      collection.searchItemType,
      request.query,
    )
    return {
      records,
    }
  } else {
    return getRecords(
      request.credentials,
      collection.key,
      request.query,
      request.cursor,
    )
  }
}

export async function findOneInCollection(
  collection,
  request: ConnectorDataCollectionFindOneRequest,
): Promise<DataCollectionFindOneResponse> {
  if (collection.searchItemType && isSearchQuery(request.query)) {
    const records = await search(
      request.credentials,
      collection.searchItemType,
      request.query,
    )
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
  { credentials, record },
): Promise<DataCollectionCreateResponse> {
  return createRecord(credentials, collection.key, record)
}

export async function updateCollectionRecord(
  collection,
  request: ConnectorDataCollectionUpdateRequest,
): Promise<DataCollectionUpdateResponse> {
  return updateRecord(
    request.credentials,
    collection.key,
    request.id,
    request.record,
  )
}
