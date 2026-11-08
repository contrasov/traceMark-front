<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Bell, House, LogOut, Settings, User } from '@lucide/vue'
import { unreadCount } from '../store/notifications'
import { logout } from '../store/session'

const route = useRoute()
const router = useRouter()

const links = [
  { to: '/', name: 'home', label: 'Início', icon: House },
  { to: '/notificacoes', name: 'notifications', label: 'Notificações', icon: Bell },
  { to: '/perfil', name: 'profile', label: 'Perfil', icon: User },
  { to: '/configuracoes', name: 'settings', label: 'Configurações', icon: Settings },
]

async function signOut() {
  logout()
  await router.replace('/entrar')
}
</script>

<template>
  <nav class="space-y-1.5 text-sm" aria-label="Menu principal">
    <ul class="space-y-1">
      <li v-for="link in links" :key="link.name">
        <RouterLink
          :to="link.to"
          class="flex items-center gap-3 rounded-2xl px-4 py-2.5 font-semibold transition"
          :class="route.name === link.name ? 'bg-card text-ink' : 'text-ink/70 hover:bg-card'"
        >
          <component :is="link.icon" class="size-5" :class="route.name === link.name ? 'text-brand' : 'text-muted'" />
          {{ link.label }}
          <span
            v-if="link.name === 'notifications' && unreadCount > 0"
            class="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white"
          >
            {{ unreadCount }}
          </span>
        </RouterLink>
      </li>
      <li>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 font-semibold text-ink/70 transition hover:bg-card"
          @click="signOut"
        >
          <LogOut class="size-5 text-muted" />
          Sair
        </button>
      </li>
    </ul>
  </nav>
</template>
