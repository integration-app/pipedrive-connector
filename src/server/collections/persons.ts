import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeOwnerSchema } from '../api/users'
import { makeVisibleToSchema } from '../api/visibility'

export async function getPersonsQuerySchema({ credentials }) {
  const SEARCH_FIELDS = ['custom_fields', 'email', 'name', 'notes', 'phone']

  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'people'),
    await makeOwnerSchema(credentials),
  ])
}

export async function getInsertPersonRecordSchema({ credentials }) {
  const type = Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: await makeOwnerSchema(credentials),
      org_id: Type.Integer({
        title: 'Organization',
        enum: [
          // ToDo: fetch orgs
          100,
        ],
      }),
      email: Type.Array(Type.String(), { title: 'Email(s)' }),
      phone: Type.Array(Type.String(), { title: 'Phone(s)' }),
      visible_to: await makeVisibleToSchema(),
      marketing_status: Type.String({
        title: 'Marketing Status',
        enum: ['no_consent', 'unsubscribed', 'subscribed', 'archived'],
      }),
    }),
  )
  type.required = ['name']
  return type
}
