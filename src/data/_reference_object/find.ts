import { FindArgs } from '@integration-app/connector-sdk'
import { DataCollectionFindResponse } from '@integration-app/sdk'

const MAX_LIMIT = 100

export default async function find(
  args: FindArgs,
): Promise<DataCollectionFindResponse> {
  const { apiClient, cursor, parameters, recordFromApi } = args

  const limit = MAX_LIMIT
  const request = {
    start: cursor ?? '0',
    limit,
  }
  const response = await apiClient.get(parameters.path, request)

  const nextCursor =
    response.additional_data?.pagination?.next_start?.toString()

  let records = response.data ?? []

  if (parameters.activeOnly) {
    records = records.filter((record) => record.active_flag)
  }

  // Match objects on our side.
  if (args.query) {
    records = records.filter((record) => {
      return Object.entries(args.query ?? []).every(([key, value]) => {
        return record[key] === value
      })
    })
  }

  records = await Promise.all(records.map(recordFromApi))

  console.log('RECORDS', records)

  return {
    records,
    cursor: nextCursor,
  }
}
