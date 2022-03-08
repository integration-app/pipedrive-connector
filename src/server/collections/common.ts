import {
  ConnectorDataCollectionQueryRequest,
  ConnectorDataCollectionUpdateRequest,
  ConnectorDataCollectionUpsertRequest,
} from '@integration-app/connector-sdk'
import {
  DataCollectionInsertResponse,
  DataCollectionQueryResponse,
  DataCollectionUpdateResponse,
  DataCollectionUpsertResponse,
} from '@integration-app/sdk/connector-api'
import { BadRequestError } from '@integration-app/sdk/errors'
import { insertRecord, queryRecords, updateRecord } from '../api/records'
import { isSearchQuery, search } from '../api/search'

export async function queryCollection(
  collection,
  request: ConnectorDataCollectionQueryRequest,
): Promise<DataCollectionQueryResponse> {
  if (collection.searchItemType && isSearchQuery(request.query)) {
    return search(request.credentials, collection.searchItemType, request.query)
  } else {
    return queryRecords(
      request.credentials,
      collection.key,
      request.query,
      request.cursor,
    )
  }
}

export async function insertCollectionRecord(
  collection,
  { credentials, record },
): Promise<DataCollectionInsertResponse> {
  return insertRecord(credentials, collection.key, record)
}

export async function updateCollectionRecord(
  collection,
  request: ConnectorDataCollectionUpdateRequest,
) {
  if (request.id) {
    return updateCollectionRecordById(collection, {
      ...request,
      id: request.id,
    })
  } else if (request.query) {
    return updateCollectionRecordByQuery(collection, {
      ...request,
      query: request.query,
    })
  } else {
    throw new BadRequestError(
      'Either `id` or `query` must be provided to update a record',
    )
  }
}

export async function upsertCollectionRecord(
  collection,
  request: ConnectorDataCollectionUpsertRequest,
) {
  if (request.id) {
    return updateCollectionRecordById(collection, {
      ...request,
      id: request.id,
    })
  } else {
    return upsertCollectionRecordByQuery(collection, request)
  }
}

async function updateCollectionRecordById(
  collection,
  { credentials, id, record },
): Promise<DataCollectionUpdateResponse> {
  return updateRecord(credentials, collection.key, id, record)
}

async function updateCollectionRecordByQuery(
  collection,
  { credentials, query, record }: ConnectorDataCollectionUpdateRequest,
): Promise<DataCollectionUpdateResponse> {
  const queryResponse = await queryCollection(collection, {
    credentials,
    query,
  })
  if (queryResponse.records.length > 0) {
    return updateRecord(
      credentials,
      collection.key,
      queryResponse.records[0].id,
      record,
    )
  } else {
    return null
  }
}

async function upsertCollectionRecordByQuery(
  collection,
  { credentials, query, record }: ConnectorDataCollectionUpsertRequest,
): Promise<DataCollectionUpsertResponse> {
  const queryResponse = await queryCollection(collection, {
    credentials,
    query,
  })
  if (queryResponse.records.length === 1) {
    return updateRecord(
      credentials,
      collection.key,
      queryResponse.records[0].id,
      record,
    )
  } else if (queryResponse.records.length > 1) {
    throw new BadRequestError(
      'Found more than one record matching the query. Can not choose whicn one to update',
    )
  } else {
    return insertRecord(credentials, collection.key, record)
  }
}
