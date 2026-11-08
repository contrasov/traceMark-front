<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { CalendarDays, Tag } from '@lucide/vue'
import type { Photo } from '../api/types'
import { formatPrice, formatRelative, STATUS_CLASS, STATUS_LABEL } from '../utils/format'
import PhotoImage from './PhotoImage.vue'
import UserAvatar from './UserAvatar.vue'

defineProps<{ photo: Photo; showStatus?: boolean }>()
</script>

<template>
  <article class="rounded-3xl bg-card p-5">
    <div class="flex items-start gap-3">
      <RouterLink :to="`/usuarios/${photo.photographer.id}`">
        <UserAvatar :name="photo.photographer.name" size="lg" />
      </RouterLink>
      <div class="min-w-0 flex-1">
        <RouterLink :to="`/usuarios/${photo.photographer.id}`" class="text-sm font-bold hover:underline">
          {{ photo.photographer.name }}
        </RouterLink>
        <p class="text-xs text-muted">
          {{ formatRelative(photo.publishedAt ?? photo.createdAt) }}
          <template v-if="photo.eventName"> · {{ photo.eventName }}</template>
        </p>
      </div>
      <span
        v-if="showStatus && photo.status !== 'PUBLISHABLE'"
        class="rounded-full px-3 py-1 text-xs font-bold"
        :class="STATUS_CLASS[photo.status]"
      >
        {{ STATUS_LABEL[photo.status] }}
      </span>
      <span class="rounded-full bg-acid px-3 py-1 text-sm font-extrabold text-[#16161d]">
        {{ formatPrice(photo.price) }}
      </span>
    </div>

    <RouterLink :to="`/post/${photo.id}`" class="block transition hover:brightness-[0.99]">
      <h2 class="mt-4 text-left text-xl leading-snug font-extrabold">{{ photo.title }}</h2>
      <p v-if="photo.description" class="mt-2 line-clamp-3 text-left text-[15px] leading-relaxed text-ink/80">
        {{ photo.description }}
      </p>
      <PhotoImage :photo="photo" aspect class="mt-4" />
    </RouterLink>

    <p v-if="showStatus && photo.processingError" class="mt-3 text-xs text-red-600">
      Motivo: {{ photo.processingError }}
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
      <span v-if="photo.takenAt" class="flex items-center gap-1.5">
        <CalendarDays class="size-4" />
        {{ new Date(photo.takenAt).toLocaleDateString('pt-BR') }}
      </span>
      <span v-if="photo.eventName" class="flex items-center gap-1.5">
        <Tag class="size-4" />
        {{ photo.eventName }}
      </span>
      <RouterLink :to="`/post/${photo.id}`" class="ml-auto font-bold text-brand hover:underline">
        Ver detalhes e comentários
      </RouterLink>
    </div>
  </article>
</template>
