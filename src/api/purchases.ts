import { request } from './http'
import type { OriginalDownload, Page, PageQuery, Purchase, PurchasedPhoto } from './types'

export const purchasesApi = {
  purchase: (photoId: string) => request<Purchase>('POST', `/photos/${photoId}/purchase`),

  download: (photoId: string) => request<OriginalDownload>('GET', `/photos/${photoId}/download`),

  mine: (query: PageQuery = {}) => request<Page<PurchasedPhoto>>('GET', '/purchases/me', { query: { ...query } }),
}

export async function downloadOriginal(photoId: string): Promise<void> {
  const { url, fileName } = await purchasesApi.download(photoId)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
