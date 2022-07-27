import { APIClient } from '@integration-app/connector-sdk'
import { Type } from '@sinclair/typebox'
import { getRecords } from './records'

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

export function getCustomFieldSchema({ field_type, options }) {
  switch (field_type) {
    case 'varchar':
      return Type.String()
    case 'varchar_auto':
      return Type.String()
    case 'varchar_options':
      return Type.String({
        enum: (options ?? []).map((value) => value),
        allowCustom: true,
      })
    case 'text':
      return Type.String()
    case 'phone':
      return Type.String()
    case 'int':
      return Type.Number()
    case 'double':
      return Type.Number()
    case 'enum':
      return Type.String({
        referenceRecords: (options ?? []).map(({ id, label }) => ({
          id,
          name: label,
        })),
      })
    case 'set':
      return Type.Array(
        Type.String({
          referenceRecords: (options ?? []).map(({ id, label }) => ({
            id,
            name: label,
          })),
        }),
      )
    case 'date':
      return Type.String({
        format: 'date-time',
      })
    case 'daterange':
      return Type.String({
        format: 'date',
      })
    case 'time':
      return Type.String({
        format: 'time',
      })
    case 'timerange':
      return Type.String({
        format: 'time',
      })
    case 'address':
      return Type.String({})
    case 'org':
      return Type.Number({
        referenceCollectionPath: '/data/organizations',
      })
    case 'people':
      return Type.Number({
        referenceCollectionPath: '/data/persons',
      })
    case 'deal':
      return Type.Number({
        referenceCollectionPath: '/data/deals',
      })
    case 'user':
      return Type.Number({
        referenceCollectionPath: '/data/users',
      })
    default:
      return { type: 'string' }
  }
}
