import { Type } from '@sinclair/typebox'
import { pickBy } from 'lodash'
import axios from 'axios'
import { toSentenceCase } from 'js-convert-case'

const RECORDS_PER_PAGE_NUM = 100
const RECORDS_PER_PAGE_LIMIT = 100

const ENTITIES = {
  deals: {
    slug: 'deal',
  },
  organizations: {
    slug: 'organization',
  },
  persons: {
    slug: 'person',
  },
  products: {
    slug: 'product',
  },
}

export const getLegacyRootResponse = () => {
  const entities = [
    'Activities',
    'Deals',
    'Goals',
    'Leads',
    'Organizations',
    'Persons',
    'Pipelines',
    'Products',
    'Users',
  ]
  const links = {
    items: entities.map((item) => {
      return {
        name: item,
        request: {
          key: `data/${item.toLowerCase()}`,
          payload: {
            startNext: 0,
          },
        },
      }
    }),
  }
  return { links }
}

export const getItems = async (
  entity: string,
  credentials: any,
  payload: any,
) => {
  if (payload.query?.search && payload.query?.search?.term) {
    return await searchRecords(entity, credentials, payload)
  }
  if (payload.query?.userSearch) {
    return await searchUsers(entity, payload, credentials)
  }
  return await getRecords(entity, credentials, payload)
}

export const getRecords = async (
  entity: string,
  credentials: any,
  payload: any,
) => {
  const records: any[] = []
  const params = pickBy(
    {
      api_token: credentials.api_token,
      filter_id: payload.query?.filter,
      limit: RECORDS_PER_PAGE_NUM,
      start: payload.startNext ?? 0,
    },
    (propt: any) => propt !== undefined,
  )

  const retrievedData = await requestRecordsPage(entity, params)

  // 'goals' entity has slightly different response structure
  if (entity === 'goals') {
    retrievedData.data
      .map((item) => item.goals)
      .forEach((item) => {
        if (item) records.push(...item)
      })
  } else {
    retrievedData.data.forEach((item) => {
      if (item) records.push(...item)
    })
  }

  const responsePayload = {
    startNext: !retrievedData.hasNext
      ? -1
      : payload.startNext + RECORDS_PER_PAGE_NUM,
    query: payload.query,
  }

  return await makeResponse(
    entity,
    await addUrlToRecords(credentials, entity, records),
    credentials,
    responsePayload,
  )
}

export const searchRecords = async (
  entity: string,
  credentials: any,
  payload: any,
) => {
  const records = []
  const entitiesSearchItemsMap = new Map([
    ['deals', 'deal'],
    ['organizations', 'organization'],
    ['persons', 'person'],
    ['products', 'product'],
  ])

  if (!entitiesSearchItemsMap.has(entity)) {
    return []
  }

  const searchConfig = payload.query?.search

  if (!searchConfig) {
    return []
  }

  // By pipedrive API 'term' parameter should be at least 2 characters long
  const params = pickBy(
    {
      api_token: credentials.api_token,
      term: searchConfig.term,
      item_types: [entitiesSearchItemsMap.get(entity)],
      fields: [searchConfig.field],
      search_for_related_items: false,
      limit: RECORDS_PER_PAGE_LIMIT,
      start: payload.startNext,
    },
    (propt: any) => propt !== undefined,
  )

  const retrievedData = await requestRecordsPage('itemSearch', params)

  retrievedData.data
    .map((item) => item.items)
    .forEach((item) => {
      if (item) records.push(...item.map((item: any) => item.item))
    })

  const responsePayload = {
    startNext: -1,
    query: {
      search: searchConfig,
    },
  }

  return await makeResponse(
    entity,
    await addUrlToRecords(credentials, entity, records),
    credentials,
    responsePayload,
  )
}

async function addUrlToRecords(credentials, entity, records) {
  if (ENTITIES[entity]?.slug) {
    const subdomain = await getSubdomain(credentials)
    return records.map((record) => ({
      ...record,
      url: `https://${subdomain}.pipedrive.com/${ENTITIES[entity].slug}/${record.id}`,
    }))
  } else {
    return records
  }
}

async function getSubdomain(credentials) {
  const response = await axios.get(
    'https://api.pipedrive.com/v1/users/me?api_token=' + credentials.api_token,
  )
  return response.data.data.company_domain
}

export const searchUsers = async (
  entity: string,
  payload: any,
  credentials: any,
) => {
  const records = []
  const userSearchConfig = payload.query.userSearch
  const params = {
    api_token: credentials.api_token,
    term: userSearchConfig.term,
    search_by_email: userSearchConfig.field === 'Name' ? 0 : 1,
  }
  const retrievedData = await requestRecordsPage('users/find', params)

  retrievedData.data.forEach((item) => {
    if (item) records.push(...item)
  })

  const responsePayload = {
    startNext: -1,
    query: payload.query,
  }

  return await makeResponse(entity, records, credentials, responsePayload)
}

export const getFilters = async (entity: string, credentials: any) => {
  const filters = []
  const entitiesFilterMap = new Map([
    ['activities', 'activity'],
    ['deals', 'deals'],
    ['leads', 'leads'],
    ['organizations', 'org'],
    ['persons', 'people'],
    ['products', 'products'],
  ])

  if (!entitiesFilterMap.has(entity)) {
    return []
  }

  const params = {
    api_token: credentials.api_token,
    type: entitiesFilterMap.get(entity),
  }
  const data = await requestAllRecords('filters', params)

  data.forEach((item) => {
    if (item) filters.push(...item)
  })
  return filters
}

export const getSearchFields = async (entity: string) => {
  const entitiesearchFieldsMap = new Map<string, Array<string>>([
    ['deals', ['custom_fields', 'notes', 'title']],
    ['organizations', ['address', 'custom_fields', 'name', 'notes']],
    ['persons', ['custom_fields', 'email', 'name', 'notes', 'phone']],
    ['products', ['code', 'custom_fields', 'name']],
    [
      'leads',
      [
        'custom_fields',
        'notes',
        'email',
        'organization_name',
        'person_name',
        'phone',
        'title',
      ],
    ],
  ])

  if (!entitiesearchFieldsMap.has(entity)) {
    return []
  }
  return entitiesearchFieldsMap.get(entity).map((field) => {
    return { value: field, label: toSentenceCase(field) }
  })
}

export const requestAllRecords = async (entity: string, params: any) => {
  const items = []
  let cont = true

  while (cont === true) {
    const url = constructUrl(entity, params)
    try {
      const response = await axios(url)
      const data = response.data

      items.push(data.data)

      if (
        data.additional_data &&
        data.additional_data.pagination !== undefined
      ) {
        params.start = data.additional_data.pagination.next_start
        cont = data.additional_data.pagination.more_items_in_collection
      } else {
        cont = false
      }
    } catch (err) {
      throw err
    }
  }
  return items
}

export const requestRecordsPage = async (entity: string, params: any) => {
  const items = []
  let hasNext = true

  const url = constructUrl(entity, params)
  try {
    const response = await axios(url)
    const data = response.data

    items.push(data.data)

    if (data.additional_data && data.additional_data.pagination !== undefined) {
      hasNext = data.additional_data.pagination.more_items_in_collection
    } else {
      hasNext = false
    }
  } catch (err) {
    throw err
  }
  return { data: items, hasNext: hasNext }
}

export const constructUrl = (entity: string, params: any): any => {
  const baseUrl = 'https://api.pipedrive.com/v1'

  if (entity === 'goals') {
    entity += '/find'
  }
  return {
    method: 'get',
    url: baseUrl + `/${entity}`,
    params: params,
  }
}

export const makeResponse = async (
  entity: string,
  items: any[],
  credentials: any,
  payload: any,
): Promise<any> => {
  const queryConfigSchemas = [] // Possible query config schemas that will be returned through oneOf

  const filterIds = await getFilters(entity, credentials)
  const searchFields = await getSearchFields(entity)
  let newRecordsRequest: any = null

  const filterSchema = Type.String({
    enum: filterIds.map((item: any) => {
      return { value: item.id, label: item.name }
    }),
    title: 'Filter',
  })
  const searchSchema = Type.Object({
    field: Type.String({
      enum: searchFields,
      title: 'Field',
    }),
    term: Type.String({ title: 'Term' }),
  })

  if (filterIds.length !== 0) {
    queryConfigSchemas.push({
      type: 'object',
      title: 'Use Saved Filter',
      properties: {
        filter: filterSchema,
      },
    })
  }

  if (searchFields.length !== 0) {
    queryConfigSchemas.push({
      type: 'object',
      title: 'Search by Field',
      properties: {
        search: searchSchema,
      },
    })
  }

  if (entity === 'users') {
    queryConfigSchemas.push({
      type: 'object',
      title: 'Search by Field',
      properties: {
        userSearch: Type.Object({
          field: Type.String({
            enum: ['Name', 'Email'],
            title: 'Field',
          }),
          term: Type.String({ title: 'Term' }),
        }),
      },
    })
  }

  if (payload.startNext !== -1) {
    newRecordsRequest = {
      key: `data/${entity}`,
      payload: payload,
    }
  }

  const requestSpecPayload = {
    query: {
      $ref: '$',
    },
    startNext: 0,
  }

  return {
    requestSpec: {
      key: `data/${entity}`,
      variablesSchema: Type.Union(queryConfigSchemas),
      payload: requestSpecPayload,
    },
    records: {
      items: items,
      nextPageRequest: newRecordsRequest,
    },
  }
}

export async function makeApiRequest(
  credentials: any,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  data?: string,
) {
  return axios.request({
    url: `https://api.pipedrive.com/v1${path}?api_token=${credentials.api_token}`,
    method: method,
    data,
  })
}
