import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeOwnerSchema(credentials) {
  const users = await getUsers(credentials)
  return Type.String({
    title: 'Owner',
    enum: users.map((user) => ({
      value: user.id.toString(),
      label: user.name,
    })),
  })
}

export async function getUsers(credentials) {
  const response = await get(credentials, 'users')
  return response.data
}
