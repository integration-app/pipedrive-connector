import { Type } from '@sinclair/typebox'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeOwnerSchema } from '../api/users'
import { makeVisibleToSchema } from '../api/visibility'

export async function getOrganizationsQuerySchema({ credentials }) {
  const SEARCH_FIELDS = ['address', 'custom_fields', 'name', 'notes']

  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'org'),
    await makeOwnerSchema(credentials),
  ])
}

export async function getOrganizationsRecordSchema({ credentials }) {
  const type = Type.Partial(
    Type.Object({
      name: Type.String(),
      owner_id: await makeOwnerSchema(credentials),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['name']
  return type
}
