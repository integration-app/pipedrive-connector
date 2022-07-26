import { APIClient, ConnectorRequestData } from '@integration-app/connector-sdk'
import { getRecords } from '../api/records'

import { Type } from '@sinclair/typebox'

export async function getCustomFields(path: string, apiClient: APIClient) {
  const fields = []

  let cursor = '0'
  while (cursor != undefined) {
    const { records, cursor: newCursor } = await getRecords({
      path,
      apiClient,
      cursor,
      extractRecord: (data) => data,
    })

    cursor = newCursor
    fields.push(...records)
  }
  return fields
}

export async function appendCustomFields(
  path: string,
  { apiClient }: ConnectorRequestData,
  fieldsSchema: any,
) {
  const getSchema = ({ name, field_type, options }) => {
    switch (field_type) {
      case 'varchar':
        return Type.String({ title: name })
      case 'varchar_auto':
        return Type.String({ title: name })
      case 'varchar_options':
        if (options === undefined) return undefined
        return Type.String({
          title: name,
          enum: options.map((value) => value),
          allowCustom: true,
        })
      case 'text':
        return Type.String({ title: name })
      case 'phone':
        return Type.String({ title: name })
      case 'int':
        return Type.Number({ title: name })
      case 'double':
        return Type.Number({ title: name })
      case 'enum':
        if (options === undefined) return undefined
        return Type.String({
          title: name,
          referenceRecords: options.map(({ id, label }) => ({
            id,
            label,
          })),
        })
      case 'set':
        if (options === undefined) return undefined
        return Type.Array(
          Type.String({
            referenceRecords: options.map(({ id, label }) => ({
              id,
              label,
            })),
          }),
          { title: name },
        )
      case 'date':
        return Type.String({
          title: name,
          format: 'date-time',
        })
      case 'daterange':
        return Type.String({
          title: name,
          format: 'date',
        })
      case 'time':
        return Type.String({
          title: name,
          format: 'time',
        })
      case 'timerange':
        return Type.String({
          title: name,
          format: 'time',
        })
      case 'address':
        return Type.String({
          title: name,
        })
      case 'org':
        return Type.Number({
          title: name,
          referenceCollectionPath: '/data/organizations',
        })
      case 'people':
        return Type.Number({
          title: name,
          referenceCollectionPath: '/data/persons',
        })
      case 'deal':
        return Type.Number({
          title: name,
          referenceCollectionPath: '/data/deals',
        })
      case 'user':
        return Type.Number({
          title: name,
          referenceCollectionPath: '/data/users',
        })
      default:
        return undefined
    }
  }

  const customFields = await getCustomFields(path, apiClient)

  for (const { key, ...field } of customFields) {
    const schema = getSchema(field)
    if (schema !== undefined) fieldsSchema.properties[key] = schema
  }

  return fieldsSchema
}
