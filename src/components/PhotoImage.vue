<script setup lang="ts">
import { ImageOff, Loader } from '@lucide/vue'
import type { Photo } from '../api/types'

defineProps<{ photo: Photo; aspect?: boolean }>()
</script>

<template>
  <figure class="relative">
    <img
      v-if="photo.image"
      :src="photo.image.url"
      :alt="photo.title"
      loading="lazy"
      class="w-full rounded-2xl bg-sub object-cover"
      :class="aspect ? 'aspect-[16/9]' : ''"
    >
    <div
      v-else
      class="grid w-full place-items-center rounded-2xl bg-sub text-sm text-muted"
      :class="aspect ? 'aspect-[16/9]' : 'aspect-[4/3]'"
    >
      <span class="flex flex-col items-center gap-2">
        <Loader v-if="photo.status === 'PROCESSING'" class="size-6 animate-spin" />
        <ImageOff v-else class="size-6" />
        {{ photo.status === 'PROCESSING' ? 'Aplicando marca-d\'água...' : 'Imagem indisponível' }}
      </span>
    </div>
    <figcaption
      v-if="photo.image"
      class="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white"
    >
      {{ photo.image.variant === 'ORIGINAL' ? 'Original' : 'Com marca-d\'água' }}
    </figcaption>
  </figure>
</template>
