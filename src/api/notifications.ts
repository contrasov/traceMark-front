import { request } from './http'
import type { Notification, NotificationPage, PageQuery } from './types'

export const notificationsApi = {
  list: (query: PageQuery & { unread?: boolean } = {}) =>
    request<NotificationPage>('GET', '/notifications', { query: { ...query } }),

  markAsRead: (id: string) => request<Notification>('PATCH', `/notifications/${id}/read`),

  markAllAsRead: () => request<{ updated: number }>('PATCH', '/notifications/read-all'),
}
