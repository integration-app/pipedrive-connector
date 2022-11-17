import {
  ConnectorDataCollectionCreateRequest,
  ConnectorDataCollectionFindRequest,
  ConnectorDataCollectionUpdateRequest,
  DataCollectionHandler,
} from '@integration-app/connector-sdk'
import { SpecArgs } from '@integration-app/connector-sdk/dist/handlers/data-collection'
import {
  DataCollectionCreateResponse,
  DataCollectionFindResponse,
  DataCollectionUpdateResponse,
} from '@integration-app/sdk/data-locations'
import { MAX_LIMIT } from '../../api'

export default new DataCollectionHandler({
  spec: async (args: SpecArgs) => {
    return args.defaultSpec
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
  extractRecord,
}: ConnectorDataCollectionFindRequest): Promise<DataCollectionFindResponse> {
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

  records = await Promise.all(records.map(extractRecord))

  return {
    records,
    cursor: nextCursor,
  }
}

async function addDealtoProduct({
  apiClient,
  parameters,
  fields,
}: ConnectorDataCollectionCreateRequest): Promise<DataCollectionCreateResponse> {
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
}: ConnectorDataCollectionUpdateRequest): Promise<DataCollectionUpdateResponse> {
  const response = await apiClient.put(
    `deals/${parameters.deal_id}/products/${id}`,
    fields,
  )
  return {
    id: response?.data?.id.toString(),
  }
}
