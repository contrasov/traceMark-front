import { request } from './http'
import type { AuthResponse, PrivateUser, UserRole } from './types'

export const authApi = {
  register: (body: { name: string; email: string; password: string; role: UserRole }) =>
    request<AuthResponse>('POST', '/auth/register', { body }),

  login: (body: { email: string; password: string }) => request<AuthResponse>('POST', '/auth/login', { body }),

  me: () => request<PrivateUser>('GET', '/auth/me'),
}
