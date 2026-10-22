<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Aperture, CirclePlus, Search } from '@lucide/vue'
import { newPostOpen } from '../store/feed'
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

      <label
        class="ml-2 hidden max-w-sm flex-1 items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 md:flex"
      >
        <Search class="size-4 text-muted" />
        <input
          type="search"
          placeholder="Buscar fotos, fotógrafos e corridas"
          class="w-full bg-transparent text-sm placeholder-muted outline-none"
        />
      </label>

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
          @click="newPostOpen = true"
        >
          <CirclePlus class="size-4" />
          Novo post
        </button>
      </div>
    </div>
  </header>
</template>
