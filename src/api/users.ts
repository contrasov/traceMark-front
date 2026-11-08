import { request } from './http'
import type { PrivateUser, PublicUser } from './types'

export const usersApi = {
  get: (id: string) => request<PublicUser>('GET', `/users/${id}`),

  updateMe: (body: { name?: string; bio?: string | null }) => request<PrivateUser>('PATCH', '/users/me', { body }),
}
