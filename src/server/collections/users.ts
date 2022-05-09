import { Type } from '@sinclair/typebox'
import { getRecords } from '../api/records'

const FIELDS_SCHEMA = Type.Partial(
  Type.Object({
    id: Type.Number(),
    name: Type.String(),
    default_currency: Type.String(),
    locale: Type.String(),
    lang: Type.Number(),
    email: Type.String(),
    phone: Type.String(),
    activated: Type.Boolean(),
    last_login: Type.String({ format: 'date-time' }),
    created: Type.String({ format: 'date-time' }),
    modified: Type.String({ format: 'date-time' }),
    signup_flow_variation: Type.String(),
    has_created_company: Type.Boolean(),
    is_admin: Type.Boolean(),
    active_flag: Type.Boolean(),
    timezone_name: Type.String(),
    timezone_offset: Type.String(),
    role_id: Type.Number(),
    icon_url: Type.String(),
    is_you: Type.Boolean(),
  }),
)

export default {
  name: 'Users',
  uri: '/data/collections/users',
  fieldsSchema: FIELDS_SCHEMA,
  extractUnifiedFields: {
    users: extractUnifiedFields,
  },
  find: {
    handler: (request) =>
      getRecords({
        // If query is provided: https://developers.pipedrive.com/docs/api/v1/Users#findUsersByName
        // Otherwise: https://developers.pipedrive.com/docs/api/v1/Users#getUsers
        recordKey: request.query?.term ? 'users/find' : 'users',
        ...request,
      }),
  },
}

async function extractUnifiedFields({ fields }) {
  return {
    email: fields.email,
    name: fields.name,
  }
}
