import { ApiError, request } from './http'
import type { Page, PageQuery, Photo, PhotoDetails, PhotoStatus, PhotoWithUpload, PresignedUpload } from './types'

export interface NewPhoto {
  title: string
  description?: string | null
  eventName?: string | null
  takenAt?: string | null
  price: string
  fileName: string
  mimeType: string
  fileSize: number
}

export const photosApi = {
  create: (photos: NewPhoto[]) => request<{ data: PhotoWithUpload[] }>('POST', '/photos', { body: { photos } }),

  renewUploadUrl: (id: string) => request<PhotoWithUpload>('POST', `/photos/${id}/upload-url`),

  confirmUpload: (id: string) => request<Photo>('POST', `/photos/${id}/confirm-upload`),

  mine: (query: PageQuery & { status?: PhotoStatus } = {}) =>
    request<Page<Photo>>('GET', '/photos/me', { query: { ...query } }),

  get: (id: string) => request<PhotoDetails>('GET', `/photos/${id}`),
}

export async function uploadToStorage(upload: PresignedUpload, file: File): Promise<void> {
  const form = new FormData()
  for (const [key, value] of Object.entries(upload.fields)) form.append(key, value)
  form.append('file', file)

  const response = await fetch(upload.url, { method: upload.method, body: form }).catch(() => null)
  if (!response?.ok) {
    throw new ApiError(response?.status ?? 0, 'UPLOAD_FAILED', 'Falha ao enviar o arquivo para o armazenamento.')
  }
}
