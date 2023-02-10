import {
  CreateArgs,
  DataCollectionHandler,
  FindArgs,
  UpdateArgs,
} from '@integration-app/connector-sdk'
import { DataCollectionSpecArgs } from '@integration-app/connector-sdk'
import {
  DataCollectionCreateResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/data-locations'
import { MAX_LIMIT } from '../../api'

export default new DataCollectionHandler({
  spec: async (args: DataCollectionSpecArgs) => {
    return args.spec
  },
  find: (request) => {
    return findDealProducts(request)
  },
  create: (request) => {
    return addDealtoProduct(request)
  },
  update: (request) => {
    return updateDealProduct(request)
  },
})

async function findDealProducts({
  apiClient,
  parameters,
  cursor,
  recordFromApi,
}: FindArgs): Promise<DataCollectionFindResponse> {
  const limit = MAX_LIMIT
  const params = {
    start: cursor ?? '0',
    limit,
  }
  const response = await apiClient.get(
    `deals/${parameters.deal_id}/products`,
    params,
  )

  const nextCursor =
    response.additional_data?.pagination?.next_start?.toString()

  let records = response.data ?? []

  records = await Promise.all(records.map(recordFromApi))

  return {
    records,
    cursor: nextCursor,
  }
}

async function addDealtoProduct({
  apiClient,
  parameters,
  fields,
}: CreateArgs): Promise<DataCollectionCreateResponse> {
  const response = await apiClient.post(
    `deals/${parameters.deal_id}/products`,
    fields,
  )

  return {
    id: response?.data?.id.toString(),
  }
}

async function updateDealProduct({
  apiClient,
  parameters,
  id,
  fields,
}: UpdateArgs): Promise<DataCollectionUpdateResponse> {
  const response = await apiClient.put(
    `deals/${parameters.deal_id}/products/${id}`,
    fields,
  )
  return {
    id: response?.data?.id.toString(),
  }
}
