<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CircleAlert, CircleCheck, ImagePlus, Loader, X } from '@lucide/vue'
import { errorMessage } from '../api/http'
import { photosApi, uploadToStorage } from '../api/photos'
import type { PresignedUpload } from '../api/types'
import { newPostOpen, notifyPhotosChanged } from '../store/feed'

const MAX_PHOTOS = Number(import.meta.env.VITE_MAX_PHOTOS_PER_UPLOAD ?? 10)
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PRICE_PATTERN = /^\d{1,8}([.,]\d{1,2})?$/

type UploadState = 'pending' | 'uploading' | 'done' | 'error'

interface SelectedPhoto {
  file: File
  url: string
  title: string
  state: UploadState
  photoId?: string
  error?: string
}

const router = useRouter()

const description = ref('')
const eventName = ref('')
const takenAt = ref('')
const price = ref('')
const photos = ref<SelectedPhoto[]>([])
const publishing = ref(false)
const formError = ref('')

const priceValid = computed(() => PRICE_PATTERN.test(price.value.trim()))
const finished = computed(() => photos.value.length > 0 && photos.value.every((p) => p.state === 'done'))
const hasFailures = computed(() => photos.value.some((p) => p.state === 'error'))
const canPublish = computed(
  () =>
    photos.value.length > 0 &&
    priceValid.value &&
    photos.value.every((p) => p.title.trim()) &&
    !publishing.value &&
    !photos.value.some((p) => p.photoId),
)

watch(newPostOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) reset()
})

function reset() {
  description.value = ''
  eventName.value = ''
  takenAt.value = ''
  price.value = ''
  formError.value = ''
  photos.value.forEach((p) => URL.revokeObjectURL(p.url))
  photos.value = []
}

function titleFrom(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 120) || 'Foto da corrida'
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement | null
  const files = input?.files
  if (!files) return
  formError.value = ''
  for (const file of Array.from(files)) {
    if (photos.value.length >= MAX_PHOTOS) {
      formError.value = `Limite de ${MAX_PHOTOS} fotos por publicação.`
      break
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      formError.value = `${file.name}: use JPG, PNG ou WEBP.`
      continue
    }
    photos.value.push({ file, url: URL.createObjectURL(file), title: titleFrom(file.name), state: 'pending' })
  }
  if (input) input.value = ''
}

function removePhoto(index: number) {
  const [removed] = photos.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.url)
}

function close() {
  if (publishing.value) return
  newPostOpen.value = false
}

async function sendFile(photo: SelectedPhoto, upload: PresignedUpload) {
  photo.state = 'uploading'
  photo.error = undefined
  try {
    await uploadToStorage(upload, photo.file)
    await photosApi.confirmUpload(photo.photoId!)
    photo.state = 'done'
  } catch (err) {
    photo.state = 'error'
    photo.error = errorMessage(err)
  }
}

async function publish() {
  if (!canPublish.value) return
  publishing.value = true
  formError.value = ''
  try {
    const { data } = await photosApi.create(
      photos.value.map((photo) => ({
        title: photo.title.trim(),
        description: description.value.trim() || null,
        eventName: eventName.value.trim() || null,
        takenAt: takenAt.value ? new Date(takenAt.value).toISOString() : null,
        price: price.value.trim().replace(',', '.'),
        fileName: photo.file.name,
        mimeType: photo.file.type,
        fileSize: photo.file.size,
      })),
    )
    data.forEach((created, index) => {
      const photo = photos.value[index]
      if (photo) photo.photoId = created.photo.id
    })
    await Promise.all(data.map((created, index) => sendFile(photos.value[index]!, created.upload)))
    notifyPhotosChanged()
  } catch (err) {
    formError.value = errorMessage(err)
  } finally {
    publishing.value = false
  }
}

async function retry(photo: SelectedPhoto) {
  if (!photo.photoId) return
  publishing.value = true
  try {
    const { upload } = await photosApi.renewUploadUrl(photo.photoId)
    await sendFile(photo, upload)
    notifyPhotosChanged()
  } catch (err) {
    photo.state = 'error'
    photo.error = errorMessage(err)
  } finally {
    publishing.value = false
  }
}

async function goToProfile() {
  newPostOpen.value = false
  await router.push('/perfil')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="newPostOpen"
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4"
      @click.self="close"
    >
      <section class="my-6 w-full max-w-xl rounded-3xl bg-card p-6" aria-label="Nova publicação">
        <header class="flex items-center justify-between">
          <h2 class="text-lg font-extrabold">Nova publicação</h2>
          <button
            type="button"
            aria-label="Fechar"
            class="grid size-8 place-items-center rounded-full text-ink/70 transition hover:bg-sub disabled:opacity-40"
            :disabled="publishing"
            @click="close"
          >
            <X class="size-5" />
          </button>
        </header>

        <div v-if="finished" class="mt-6 text-center">
          <CircleCheck class="mx-auto size-10 text-emerald-600" />
          <p class="mt-3 font-bold">{{ photos.length }} foto(s) enviada(s)!</p>
          <p class="mt-1 text-sm text-muted">
            A marca-d'água está sendo aplicada. Você será notificado quando estiverem no mural.
          </p>
          <div class="mt-5 flex justify-center gap-2">
            <button
              type="button"
              class="rounded-full border border-line px-5 py-2 text-sm font-bold text-ink/70 transition hover:bg-sub"
              @click="close"
            >
              Fechar
            </button>
            <button
              type="button"
              class="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:brightness-105"
              @click="goToProfile"
            >
              Acompanhar no perfil
            </button>
          </div>
        </div>

        <template v-else>
          <label v-if="!photos.some((p) => p.photoId)" class="mt-5 block cursor-pointer">
            <span
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center transition hover:border-brand"
            >
              <ImagePlus class="size-6 text-muted" />
              <span class="text-sm font-semibold">Clique para escolher suas fotos</span>
              <span class="text-xs text-muted">JPG, PNG ou WEBP · até {{ MAX_PHOTOS }} fotos</span>
            </span>
            <input
              type="file"
              :accept="ACCEPTED_TYPES.join(',')"
              multiple
              class="sr-only"
              @change="onFiles"
            />
          </label>

          <ul v-if="photos.length > 0" class="mt-4 space-y-2">
            <li v-for="(photo, i) in photos" :key="photo.url" class="flex items-center gap-3 rounded-2xl bg-sub p-2">
              <img :src="photo.url" :alt="photo.title" class="size-14 shrink-0 rounded-xl object-cover" />
              <div class="min-w-0 flex-1">
                <input
                  v-model="photo.title"
                  type="text"
                  maxlength="120"
                  placeholder="Título da foto"
                  :disabled="!!photo.photoId"
                  class="w-full rounded-xl border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-brand"
                />
                <p v-if="photo.error" class="mt-1 text-xs text-red-600">{{ photo.error }}</p>
              </div>
              <Loader v-if="photo.state === 'uploading'" class="size-5 animate-spin text-muted" />
              <CircleCheck v-else-if="photo.state === 'done'" class="size-5 text-emerald-600" />
              <button
                v-else-if="photo.state === 'error'"
                type="button"
                class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-red-600 hover:bg-card"
                :disabled="publishing"
                @click="retry(photo)"
              >
                <CircleAlert class="size-4" /> Tentar de novo
              </button>
              <button
                v-else
                type="button"
                :aria-label="`Remover ${photo.title}`"
                class="grid size-7 place-items-center rounded-full text-ink/60 transition hover:text-brand"
                @click="removePhoto(i)"
              >
                <X class="size-4" />
              </button>
            </li>
          </ul>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs font-bold tracking-wide text-muted uppercase">Preço (R$)</span>
              <input
                v-model="price"
                type="text"
                inputmode="decimal"
                placeholder="29,90"
                class="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand/25"
                :class="price && !priceValid ? 'border-red-400' : 'border-line focus:border-brand'"
              />
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-bold tracking-wide text-muted uppercase">Corrida (opcional)</span>
              <input
                v-model="eventName"
                type="text"
                maxlength="160"
                placeholder="Maratona de Fortaleza 2026"
                class="w-full rounded-2xl border border-line px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </label>
            <label class="block sm:col-span-2">
              <span class="mb-1 block text-xs font-bold tracking-wide text-muted uppercase">Data e hora da foto (opcional)</span>
              <input
                v-model="takenAt"
                type="datetime-local"
                class="w-full rounded-2xl border border-line px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </label>
          </div>

          <textarea
            v-model="description"
            rows="3"
            maxlength="2000"
            placeholder="Escreva uma descrição para suas fotos..."
            class="mt-3 w-full resize-none rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          />

          <p v-if="formError" class="mt-2 text-sm text-red-600">{{ formError }}</p>
          <p v-if="hasFailures" class="mt-2 text-sm text-muted">
            Algumas fotos falharam. Tente de novo ou feche: elas ficam no seu perfil como "Aguardando envio".
          </p>

          <footer class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-full border border-line px-5 py-2 text-sm font-bold text-ink/70 transition hover:bg-sub disabled:opacity-40"
              :disabled="publishing"
              @click="close"
            >
              {{ photos.some((p) => p.photoId) ? 'Fechar' : 'Cancelar' }}
            </button>
            <button
              v-if="!photos.some((p) => p.photoId)"
              type="button"
              class="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canPublish"
              @click="publish"
            >
              {{ publishing ? 'Enviando...' : `Publicar ${photos.length || ''} foto(s)` }}
            </button>
          </footer>
        </template>
      </section>
    </div>
  </Teleport>
</template>
