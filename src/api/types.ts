export type UserRole = 'PHOTOGRAPHER' | 'USER'
export type PhotoStatus = 'UPLOADING' | 'PROCESSING' | 'PUBLISHABLE' | 'ERROR'
export type ImageVariant = 'ORIGINAL' | 'WATERMARKED'
export type NotificationType = 'PHOTO_PUBLISHED' | 'PHOTO_PROCESSING_FAILED' | 'NEW_COMMENT' | 'PHOTO_SOLD'

export interface UserSummary {
  id: string
  name: string
}

export interface PublicUser extends UserSummary {
  role: UserRole
  bio: string | null
  createdAt: string
}

export interface PrivateUser extends PublicUser {
  email: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: PrivateUser
}

export interface PhotoImage {
  variant: ImageVariant
  url: string
  expiresAt: string
}

export interface PhotoBase {
  id: string
  title: string
  description: string | null
  eventName: string | null
  takenAt: string | null
  price: string
  status: PhotoStatus
  mimeType: string
  fileSize: number
  processingError: string | null
  createdAt: string
  publishedAt: string | null
}

export interface Photo extends PhotoBase {
  photographer: UserSummary
  image: PhotoImage | null
}

export interface Comment {
  id: string
  photoId: string
  content: string
  author: UserSummary
  createdAt: string
  updatedAt: string
}

export interface PhotoDetails extends Photo {
  purchasedAt: string | null
  comments: Page<Comment>
}

export interface Purchase {
  id: string
  photoId: string
  price: string
  purchasedAt: string
}

export interface PurchasedPhoto extends Purchase {
  photo: Photo
}

export interface OriginalDownload {
  url: string
  expiresAt: string
  fileName: string
}

export interface PresignedUpload {
  method: 'POST'
  url: string
  fields: Record<string, string>
  expiresAt: string
}

export interface PhotoWithUpload {
  photo: PhotoBase
  upload: PresignedUpload
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  photoId: string | null
  readAt: string | null
  createdAt: string
}

export interface Page<T> {
  data: T[]
  nextCursor: string | null
}

export interface NotificationPage extends Page<Notification> {
  unreadCount: number
}

export interface PageQuery {
  limit?: number
  cursor?: string | null
}
