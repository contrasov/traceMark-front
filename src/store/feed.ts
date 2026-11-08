import { ref } from 'vue'

export const newPostOpen = ref(false)

export const photosChangedAt = ref(0)

export function notifyPhotosChanged() {
  photosChangedAt.value = Date.now()
}
