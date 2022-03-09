import { Type } from '@sinclair/typebox'
import { makePipelineSchema } from '../api/pipelines'
import { makeSavedFilterQuerySchema } from '../api/saved-filters'
import { makeSearchQuerySchema } from '../api/search'
import { makeStageSchema } from '../api/stages'
import { makeOwnerSchema } from '../api/users'
import { makeVisibleToSchema } from '../api/visibility'

const SEARCH_FIELDS = ['custom_fields', 'notes', 'title']

export async function getFindDealsQuerySchema({ credentials }) {
  return Type.Union([
    makeSearchQuerySchema(SEARCH_FIELDS),
    await makeSavedFilterQuerySchema(credentials, 'deals'),
    Type.Object(
      {
        user_id: await makeOwnerSchema(credentials),
        stage_id: await makeStageSchema(credentials),
        status: Type.String({
          title: 'Status',
          enum: ['open', 'won', 'lost'],
        }),
      },
      {
        title: 'Filter by Field',
      },
    ),
  ])
}

export async function getFindOneDealQuerySchema({}) {
  return makeSearchQuerySchema(SEARCH_FIELDS)
}

export async function getDealsRecordSchema({ credentials }) {
  const type = Type.Partial(
    Type.Object({
      title: Type.String(),
      value: Type.String(),
      currency: Type.String(),
      user_id: await makeOwnerSchema(credentials),
      person_id: Type.Integer(),
      org_id: Type.Integer(),
      pipeline_id: await makePipelineSchema(credentials),
      stage_id: await makeStageSchema(credentials),
      status: Type.String({ enum: ['open', 'won', 'lost'] }),
      expected_close_date: Type.String({ format: 'date' }),
      probability: Type.Integer(),
      lost_reason: Type.String(),
      visible_to: await makeVisibleToSchema(),
    }),
  )
  type.required = ['title']
  return type
}
