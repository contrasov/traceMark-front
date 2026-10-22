<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import { House, MessageCircleQuestion, Settings, User } from '@lucide/vue'
import { topics } from '../data/posts'

const route = useRoute()
const isActive = (name: string) => computed(() => route.name === name)

const isHome = isActive('home')
const isProfile = isActive('profile')
const isSettings = isActive('settings')
</script>

<template>
  <nav class="space-y-1.5 text-sm" aria-label="Menu principal">
    <ul class="space-y-1">
      <li>
        <RouterLink
          to="/"
          class="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition"
          :class="isHome ? 'bg-card text-ink' : 'text-ink/70 hover:bg-card/70'"
        >
          <House class="size-5" :class="isHome ? 'text-brand' : 'text-muted'" />
          Início
        </RouterLink>
      </li>
      <li>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold text-ink/70 transition hover:bg-card/70"
        >
          <MessageCircleQuestion class="size-5 text-muted" />
          Dúvidas
        </button>
      </li>
      <li>
        <RouterLink
          to="/perfil"
          class="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition"
          :class="isProfile ? 'bg-card text-ink' : 'text-ink/70 hover:bg-card/70'"
        >
          <User class="size-5" :class="isProfile ? 'text-brand' : 'text-muted'" />
          Perfil
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/configuracoes"
          class="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition"
          :class="isSettings ? 'bg-card text-ink' : 'text-ink/70 hover:bg-card/70'"
        >
          <Settings class="size-5" :class="isSettings ? 'text-brand' : 'text-muted'" />
          Configurações
        </RouterLink>
      </li>
    </ul>

    <p class="px-4 pb-1 pt-5 text-xs font-bold tracking-wide text-muted uppercase">Temas</p>
    <ul class="space-y-0.5">
      <li v-for="topic in topics" :key="topic.label">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-left text-[13px] font-medium text-ink/80 transition hover:bg-card"
        >
          <span class="grid size-7 place-items-center rounded-lg bg-card text-base">
            {{ topic.emoji }}
          </span>
          <span class="truncate">{{ topic.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
