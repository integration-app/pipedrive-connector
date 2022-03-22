import { Type } from '@sinclair/typebox'
import { get } from '../api'

export async function makeOwnerSchema(credentials) {
  const users = await getUsers(credentials)
  return Type.String({
    title: 'Owner',
    referenceRecords: users.map((user) => ({
      id: user.id.toString(),
      name: user.name,
    })),
  })
}

export async function getUsers(credentials) {
  const response = await get(credentials, 'users')
  return response.data
}
