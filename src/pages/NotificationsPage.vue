<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { BellOff, CheckCheck, ChevronLeft, CircleAlert, CircleCheck, MessageCircle } from '@lucide/vue'
import { errorMessage } from '../api/http'
import { notificationsApi } from '../api/notifications'
import type { Notification, NotificationType } from '../api/types'
import AppShell from '../components/AppShell.vue'
import StateMessage from '../components/StateMessage.vue'
import { usePolling } from '../composables/usePolling'
import { unreadCount } from '../store/notifications'
import { formatRelative } from '../utils/format'

const ICONS: Record<NotificationType, typeof CircleCheck> = {
  PHOTO_PUBLISHED: CircleCheck,
  PHOTO_PROCESSING_FAILED: CircleAlert,
  NEW_COMMENT: MessageCircle,
}

const router = useRouter()
const notifications = ref<Notification[]>([])
const nextCursor = ref<string | null>(null)
const onlyUnread = ref(false)
const loading = ref(true)
const error = ref('')

async function load(append = false) {
  try {
    const page = await notificationsApi.list({
      unread: onlyUnread.value,
      limit: 20,
      cursor: append ? nextCursor.value : null,
    })
    notifications.value = append ? [...notifications.value, ...page.data] : page.data
    nextCursor.value = page.nextCursor
    unreadCount.value = page.unreadCount
    error.value = ''
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

async function open(notification: Notification) {
  if (!notification.readAt) {
    const updated = await notificationsApi.markAsRead(notification.id).catch(() => null)
    if (updated) {
      Object.assign(notification, updated)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
  if (notification.photoId) await router.push(`/post/${notification.photoId}`)
}

async function markAll() {
  try {
    await notificationsApi.markAllAsRead()
    await load()
  } catch (err) {
    error.value = errorMessage(err)
  }
}

onMounted(() => load())
watch(onlyUnread, () => load())
usePolling(() => load())
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao mural
    </RouterLink>

    <section class="mt-4 rounded-3xl bg-card p-5 md:p-7">
      <header class="flex flex-wrap items-center gap-2">
        <h1 class="mr-auto text-xl font-extrabold">Notificações</h1>
        <label class="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted">
          <input v-model="onlyUnread" type="checkbox" class="accent-brand" />
          Só não lidas
        </label>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink/70 transition hover:bg-sub disabled:opacity-40"
          :disabled="unreadCount === 0"
          @click="markAll"
        >
          <CheckCheck class="size-4" /> Marcar todas como lidas
        </button>
      </header>

      <p v-if="error" class="mt-4 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{{ error }}</p>

      <StateMessage v-if="loading" title="Carregando..." />
      <div v-else-if="notifications.length === 0" class="py-10 text-center text-sm text-muted">
        <BellOff class="mx-auto mb-2 size-6" />
        Nenhuma notificação {{ onlyUnread ? 'não lida' : 'por enquanto' }}.
      </div>

      <ul class="mt-4 divide-y divide-line">
        <li v-for="notification in notifications" :key="notification.id">
          <button
            type="button"
            class="flex w-full items-start gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-sub"
            @click="open(notification)"
          >
            <component
              :is="ICONS[notification.type]"
              class="mt-0.5 size-5 shrink-0"
              :class="notification.type === 'PHOTO_PROCESSING_FAILED' ? 'text-red-600' : 'text-brand'"
            />
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2 text-sm font-bold">
                {{ notification.title }}
                <span v-if="!notification.readAt" class="size-2 rounded-full bg-brand" aria-label="Não lida" />
              </span>
              <span class="block text-sm text-ink/80">{{ notification.message }}</span>
              <span class="mt-0.5 block text-xs text-muted">{{ formatRelative(notification.createdAt) }}</span>
            </span>
          </button>
        </li>
      </ul>

      <button
        v-if="nextCursor"
        type="button"
        class="mt-4 w-full rounded-full border border-line py-2.5 text-sm font-bold text-ink/70 transition hover:bg-sub"
        @click="load(true)"
      >
        Carregar mais
      </button>
    </section>
  </AppShell>
</template>
