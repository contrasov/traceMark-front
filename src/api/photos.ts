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

export function uploadToStorage(
  upload: PresignedUpload,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const form = new FormData()
  for (const [key, value] of Object.entries(upload.fields)) form.append(key, value)
  form.append('file', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const fail = () =>
      reject(new ApiError(xhr.status, 'UPLOAD_FAILED', 'Falha ao enviar o arquivo para o armazenamento.'))

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : fail())
    xhr.onerror = fail
    xhr.ontimeout = fail
    xhr.open(upload.method, upload.url)
    xhr.send(form)
  })
}
