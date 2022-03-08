import { Type } from '@sinclair/typebox'
import { makeLeadLabelSchema } from '../api/lead-labels'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeOwnerSchema } from '../api/users'

export async function getLeadsQuerySchema({ credentials }) {
  const SEARCH_FIELDS = [
    'custom_fields',
    'notes',
    'email',
    'organization_name',
    'person_name',
    'phone',
    'title',
  ]

  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'leads'),
    Type.Object(
      {
        user_id: await makeOwnerSchema(credentials),
      },
      {
        title: 'Filter by Field',
      },
    ),
  ])
}

export async function getInsertLeadRecordSchema({ credentials }) {
  const type = Type.Partial(
    Type.Object({
      title: Type.String(),
      owner_id: await makeOwnerSchema(credentials),
      label_ids: Type.Array(await makeLeadLabelSchema({ credentials }), {
        title: 'Labels',
      }),
      person_id: Type.Integer(),
      organization_id: Type.Integer(),
      expected_close_date: Type.String({
        format: 'date',
        title: 'Expected Close Date',
      }),
    }),
  )
  type.required = ['title']
  return type
}
