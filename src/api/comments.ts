import { request } from './http'
import type { Comment, Page, PageQuery } from './types'

export const commentsApi = {
  list: (photoId: string, query: PageQuery = {}) =>
    request<Page<Comment>>('GET', `/photos/${photoId}/comments`, { query: { ...query } }),

  create: (photoId: string, content: string) =>
    request<Comment>('POST', `/photos/${photoId}/comments`, { body: { content } }),

  remove: (id: string) => request<void>('DELETE', `/comments/${id}`),
}
