<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { ChevronLeft, Upload } from '@lucide/vue'
import { errorMessage } from '../api/http'
import { photosApi, uploadToStorage } from '../api/photos'
import type { Photo, PhotoStatus } from '../api/types'
import AppShell from '../components/AppShell.vue'
import PostCard from '../components/PostCard.vue'
import ProfileHeader from '../components/ProfileHeader.vue'
import StateMessage from '../components/StateMessage.vue'
import { usePolling } from '../composables/usePolling'
import { photosChangedAt } from '../store/feed'
import { currentUser, isPhotographer } from '../store/session'
import { STATUS_LABEL } from '../utils/format'

const filters: { key: PhotoStatus | undefined; label: string }[] = [
  { key: undefined, label: 'Todas' },
  { key: 'PUBLISHABLE', label: STATUS_LABEL.PUBLISHABLE },
  { key: 'PROCESSING', label: STATUS_LABEL.PROCESSING },
  { key: 'UPLOADING', label: STATUS_LABEL.UPLOADING },
  { key: 'ERROR', label: STATUS_LABEL.ERROR },
]

const status = ref<PhotoStatus | undefined>(undefined)
const photos = ref<Photo[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(true)
const error = ref('')
const uploadingId = ref<string | null>(null)

async function load(append = false) {
  if (!isPhotographer.value) return
  try {
    const page = await photosApi.mine({ status: status.value, limit: 10, cursor: append ? nextCursor.value : null })
    photos.value = append ? [...photos.value, ...page.data] : page.data
    nextCursor.value = page.nextCursor
    error.value = ''
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

async function refreshIfPending() {
  if (photos.value.some((photo) => photo.status === 'UPLOADING' || photo.status === 'PROCESSING')) await load()
}

async function sendFile(photo: Photo, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size !== photo.fileSize || file.type !== photo.mimeType) {
    error.value = `Escolha o mesmo arquivo cadastrado (${photo.mimeType}, ${photo.fileSize} bytes).`
    return
  }
  uploadingId.value = photo.id
  try {
    const { upload } = await photosApi.renewUploadUrl(photo.id)
    await uploadToStorage(upload, file)
    await photosApi.confirmUpload(photo.id)
    await load()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    uploadingId.value = null
  }
}

onMounted(() => load())
watch(status, () => {
  loading.value = true
  load()
})
watch(photosChangedAt, () => load())
usePolling(refreshIfPending, 5000)
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao mural
    </RouterLink>

    <ProfileHeader v-if="currentUser" :user="currentUser" :email="currentUser.email">
      <template #actions>
        <RouterLink
          to="/configuracoes"
          class="ml-auto rounded-full border border-line px-4 py-1.5 text-xs font-bold text-ink/70 transition hover:bg-sub"
        >
          Editar perfil
        </RouterLink>
      </template>
    </ProfileHeader>

    <template v-if="isPhotographer">
      <div class="mt-6 mb-3 flex flex-wrap items-center gap-2">
        <h2 class="mr-auto text-lg font-extrabold">Minhas fotos</h2>
        <button
          v-for="filter in filters"
          :key="filter.label"
          type="button"
          class="rounded-full px-3 py-1.5 text-xs font-bold transition"
          :class="status === filter.key ? 'bg-acid text-[#16161d]' : 'bg-card text-ink/60 hover:text-ink'"
          @click="status = filter.key"
        >
          {{ filter.label }}
        </button>
      </div>

      <p v-if="error" class="mb-3 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{{ error }}</p>

      <div class="space-y-4">
        <StateMessage v-if="loading" title="Carregando suas fotos..." />
        <StateMessage
          v-else-if="photos.length === 0"
          title="Nenhuma foto por aqui"
          description="Use o botão “Nova publicação” para enviar suas fotos."
        />
        <div v-for="photo in photos" :key="photo.id">
          <PostCard :photo="photo" show-status />
          <label
            v-if="photo.status === 'UPLOADING'"
            class="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-line bg-card py-2 text-sm font-bold text-brand transition hover:border-brand"
          >
            <Upload class="size-4" />
            {{ uploadingId === photo.id ? 'Enviando...' : 'Enviar o arquivo desta foto' }}
            <input
              type="file"
              class="sr-only"
              :accept="photo.mimeType"
              :disabled="uploadingId !== null"
              @change="sendFile(photo, $event)"
            />
          </label>
        </div>
        <button
          v-if="nextCursor"
          type="button"
          class="w-full rounded-full border border-line bg-card py-3 text-sm font-bold text-ink/70 transition hover:bg-sub"
          @click="load(true)"
        >
          Carregar mais
        </button>
      </div>
    </template>

    <StateMessage
      v-else
      class="mt-6"
      title="Você está como corredor"
      description="Explore o mural para encontrar as fotos das suas corridas e comentar."
    />
  </AppShell>
</template>
