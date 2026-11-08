<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RefreshCw } from '@lucide/vue'
import { feedApi } from '../api/feed'
import { errorMessage } from '../api/http'
import type { Photo } from '../api/types'
import AppShell from '../components/AppShell.vue'
import PostCard from '../components/PostCard.vue'
import StateMessage from '../components/StateMessage.vue'
import { usePolling } from '../composables/usePolling'
import { photosChangedAt } from '../store/feed'

const PAGE_SIZE = 10

const photos = ref<Photo[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const updatedAt = ref<Date | null>(null)

async function loadFirstPage() {
  try {
    const page = await feedApi.list({ limit: PAGE_SIZE })
    const firstIds = new Set(page.data.map((photo) => photo.id))
    const olderPages = photos.value.slice(PAGE_SIZE).filter((photo) => !firstIds.has(photo.id))
    photos.value = [...page.data, ...olderPages]
    if (olderPages.length === 0) nextCursor.value = page.nextCursor
    updatedAt.value = new Date()
    error.value = ''
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!nextCursor.value) return
  loadingMore.value = true
  try {
    const page = await feedApi.list({ limit: PAGE_SIZE, cursor: nextCursor.value })
    const known = new Set(photos.value.map((photo) => photo.id))
    photos.value.push(...page.data.filter((photo) => !known.has(photo.id)))
    nextCursor.value = page.nextCursor
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loadingMore.value = false
  }
}

onMounted(loadFirstPage)
usePolling(loadFirstPage)
watch(photosChangedAt, loadFirstPage)
</script>

<template>
  <AppShell>
    <div class="flex items-center justify-between rounded-2xl bg-card px-5 py-3">
      <h1 class="text-lg font-extrabold">Mural</h1>
      <button
        type="button"
        class="flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
        @click="loadFirstPage"
      >
        <RefreshCw class="size-3.5" />
        {{ updatedAt ? `Atualizado às ${updatedAt.toLocaleTimeString('pt-BR')}` : 'Atualizar' }}
      </button>
    </div>

    <StateMessage v-if="loading" title="Carregando o mural..." />
    <StateMessage v-else-if="error && photos.length === 0" title="Não foi possível carregar o mural" :description="error" tone="error" />
    <StateMessage
      v-else-if="photos.length === 0"
      title="Nenhuma foto publicada ainda"
      description="Assim que um fotógrafo publicar e a marca-d'água for aplicada, as fotos aparecem aqui."
    />

    <PostCard v-for="photo in photos" :key="photo.id" :photo="photo" />

    <button
      v-if="nextCursor"
      type="button"
      class="w-full rounded-full border border-line bg-card py-3 text-sm font-bold text-ink/70 transition hover:bg-sub disabled:opacity-50"
      :disabled="loadingMore"
      @click="loadMore"
    >
      {{ loadingMore ? 'Carregando...' : 'Carregar mais' }}
    </button>
  </AppShell>
</template>
