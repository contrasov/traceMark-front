import { request } from './http'
import type { Page, PageQuery, Photo } from './types'

export const feedApi = {
  list: (query: PageQuery = {}) => request<Page<Photo>>('GET', '/feed', { query: { ...query } }),
}
