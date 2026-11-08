<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { onMounted } from 'vue'
import { Aperture, Bell, CirclePlus } from '@lucide/vue'
import { usePolling } from '../composables/usePolling'
import { newPostOpen } from '../store/feed'
import { refreshUnreadCount, unreadCount } from '../store/notifications'
import { currentUser, isPhotographer } from '../store/session'
import UserAvatar from './UserAvatar.vue'

onMounted(() => refreshUnreadCount().catch(() => undefined))
usePolling(refreshUnreadCount)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
    <div class="mx-auto flex w-full max-w-full items-center gap-4 px-4 py-3 md:px-6">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <span class="grid size-9 place-items-center rounded-xl bg-brand text-white">
          <Aperture class="size-5" />
        </span>
        <span class="text-xl font-bold tracking-tight">traceMark</span>
      </RouterLink>

      <div class="ml-auto flex items-center gap-2">
        <button
          v-if="isPhotographer"
          type="button"
          class="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-bold text-white transition hover:brightness-105"
          @click="newPostOpen = true"
        >
          <CirclePlus class="size-4" />
          <span class="hidden sm:inline">Nova publicação</span>
        </button>

        <RouterLink
          to="/notificacoes"
          class="relative grid size-10 place-items-center rounded-full text-ink/70 transition hover:bg-sub"
          :aria-label="`Notificações (${unreadCount} não lidas)`"
        >
          <Bell class="size-5" />
          <span
            v-if="unreadCount > 0"
            class="absolute right-1 top-1 grid min-w-4.5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </RouterLink>

        <RouterLink v-if="currentUser" to="/perfil" aria-label="Meu perfil">
          <UserAvatar :name="currentUser.name" size="sm" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
