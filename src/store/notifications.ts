import { ref } from 'vue'
import { notificationsApi } from '../api/notifications'

export const unreadCount = ref(0)

export async function refreshUnreadCount() {
  const page = await notificationsApi.list({ limit: 1, unread: true })
  unreadCount.value = page.unreadCount
}
