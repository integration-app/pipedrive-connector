import { FindArgs } from '@integration-app/connector-sdk'
import { DataCollectionFindResponse } from '@integration-app/sdk'

const MAX_LIMIT = 100

export default async function find(
  args: FindArgs,
): Promise<DataCollectionFindResponse> {
  if (args.query) {
    return matchRecords(args)
  } else {
    return listRecords(args)
  }
}

export async function matchRecords(
  args: FindArgs,
): Promise<DataCollectionFindResponse> {
  const { apiClient, query, parameters, recordFromApi } = args
  const firstField = Object.entries(query ?? [])[0]
  const field = firstField?.[0]
  const term = firstField?.[1]

  if (!field || !term) {
    throw new Error('Query fields were not provided')
  }

  const request = {
    term,
    fields: field,
    exact_match: true,
  } as any

  const response = await apiClient.get(`${parameters.path}/search`, request)

  const records = (response.data?.items ?? []).map((item) => item.item)

  const result = {
    records: await Promise.all(records.map(recordFromApi)),
  }

  return result
}

export async function listRecords(
  args: FindArgs,
): Promise<DataCollectionFindResponse> {
  const { apiClient, cursor, query, parameters, recordFromApi } = args

  const limit = MAX_LIMIT
  const request = {
    ...(query ?? {}),
    start: cursor ?? '0',
    ...(parameters?.filter_id ? { filter_id: parameters.filter_id } : {}),
    ...(parameters?.type ? { type: parameters?.type } : {}),
    limit,
  }
  const response = await apiClient.get(parameters.path, request)

  const nextCursor =
    response.additional_data?.pagination?.next_start?.toString()

  let records = response.data ?? []

  if (parameters.activeOnly) {
    records = records.filter((record) => record.active_flag)
  }

  records = await Promise.all(records.map(recordFromApi))

  return {
    records,
    cursor: nextCursor,
  }
}
