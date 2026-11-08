<script setup lang="ts">
import type { PublicUser } from '../api/types'
import UserAvatar from './UserAvatar.vue'

defineProps<{ user: PublicUser; email?: string }>()
</script>

<template>
  <section class="mt-4 overflow-hidden rounded-3xl bg-card">
    <div class="h-32 bg-brand md:h-40" aria-hidden="true" />
    <div class="p-5 md:p-7 md:pt-0">
      <div class="-mt-9 flex items-end gap-4">
        <UserAvatar :name="user.name" size="xl" />
        <slot name="actions" />
      </div>
      <h1 class="mt-3 text-2xl font-extrabold">{{ user.name }}</h1>
      <p class="text-sm text-muted">
        {{ user.role === 'PHOTOGRAPHER' ? 'Fotógrafo' : 'Corredor' }}
        <template v-if="email"> · {{ email }}</template>
        · no traceMark desde {{ new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }}
      </p>
      <p v-if="user.bio" class="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink/85">{{ user.bio }}</p>
    </div>
  </section>
</template>
