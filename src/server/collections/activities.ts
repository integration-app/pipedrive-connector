import { Type } from '@sinclair/typebox'
import { makeActivityTypeSchema } from '../api/activity-types'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeOwnerSchema } from '../api/users'

export async function getActivitiesQuerySchema({ credentials }) {
  return Type.Union([
    await makeSavedFilterQuerySchema(credentials, 'activity'),
    Type.Object(await makeOwnerSchema(credentials)),
  ])
}

export async function getActivitiesRecordSchema({ credentials }) {
  return Type.Partial(
    Type.Object({
      type: await makeActivityTypeSchema(credentials),
      done: Type.Boolean(),
      due_date: Type.String({
        format: 'date',
      }),
      due_time: Type.String({
        format: 'time',
      }),
      duration: Type.String({
        format: 'time',
      }),
      deal_id: Type.Integer(),
      lead_id: Type.Integer(),
      person_id: Type.Integer(),
      org_id: Type.Integer(),
      note: Type.String(),
      location: Type.String(),
      public_description: Type.String(),
      subject: Type.String(),
      user_id: await makeOwnerSchema(credentials),
    }),
  )
}
