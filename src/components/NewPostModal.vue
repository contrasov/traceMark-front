<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CircleAlert, CircleCheck, ImageIcon, ImagePlus, RotateCcw, X } from '@lucide/vue'
import { errorMessage } from '../api/http'
import { photosApi, uploadToStorage } from '../api/photos'
import type { PresignedUpload } from '../api/types'
import { newPostOpen, notifyPhotosChanged } from '../store/feed'

const BATCH_SIZE = Number(import.meta.env.VITE_MAX_PHOTOS_PER_UPLOAD ?? 30)
const MAX_PHOTOS = Number(import.meta.env.VITE_MAX_PHOTOS_PER_SELECTION ?? 300)
const MAX_FILE_MB = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB ?? 15)
const PARALLEL_UPLOADS = 4
const THUMBNAIL_WIDTH = 112
const EXTENSIONS_BY_TYPE: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
}
const ACCEPTED_TYPES = Object.keys(EXTENSIONS_BY_TYPE)
const PRICE_PATTERN = /^\d{1,8}([.,]\d{1,2})?$/

type UploadState = 'pending' | 'uploading' | 'done' | 'error'

interface SelectedPhoto {
  key: number
  file: File
  thumbnail: string | null
  title: string
  state: UploadState
  progress: number
  photoId?: string
  error?: string
}

const router = useRouter()

const description = ref('')
const eventName = ref('')
const takenAt = ref('')
const price = ref('')
const photos = ref<SelectedPhoto[]>([])
const rejected = ref<string[]>([])
const publishing = ref(false)
const formError = ref('')
const currentBatch = ref(0)
const totalBatches = ref(0)

let nextKey = 0
let generation = 0
let thumbnailQueue = Promise.resolve()

const priceValid = computed(() => PRICE_PATTERN.test(price.value.trim()))
const started = computed(() => publishing.value || photos.value.some((p) => p.photoId || p.state !== 'pending'))
const doneCount = computed(() => photos.value.filter((p) => p.state === 'done').length)
const failed = computed(() => photos.value.filter((p) => p.state === 'error'))
const finished = computed(() => photos.value.length > 0 && doneCount.value === photos.value.length)
const canPublish = computed(
  () =>
    photos.value.length > 0 &&
    priceValid.value &&
    photos.value.every((p) => p.title.trim()) &&
    !publishing.value &&
    !started.value,
)
const percent = computed(() => {
  const total = photos.value.reduce((sum, p) => sum + p.file.size, 0)
  if (!total) return 0
  const sent = photos.value.reduce((sum, p) => sum + p.file.size * (p.state === 'done' ? 1 : p.progress), 0)
  return Math.round((sent / total) * 100)
})

watch(newPostOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) reset()
})

watch(publishing, (active) => {
  if (active) window.addEventListener('beforeunload', warnBeforeUnload)
  else window.removeEventListener('beforeunload', warnBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnBeforeUnload)
  reset()
})

function warnBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault()
  event.returnValue = ''
}

function reset() {
  generation += 1
  description.value = ''
  eventName.value = ''
  takenAt.value = ''
  price.value = ''
  formError.value = ''
  rejected.value = []
  currentBatch.value = 0
  totalBatches.value = 0
  photos.value.forEach((p) => p.thumbnail && URL.revokeObjectURL(p.thumbnail))
  photos.value = []
}

function titleFrom(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 120) || 'Foto da corrida'
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

function rejectionReason(file: File): string | null {
  const allowed = EXTENSIONS_BY_TYPE[file.type]
  if (!allowed) return 'formato não suportado (use JPG, PNG ou WEBP)'
  const extension = file.name.toLowerCase().split('.').pop() ?? ''
  if (!allowed.includes(extension)) return 'extensão não corresponde ao formato do arquivo'
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `maior que ${MAX_FILE_MB} MB`
  if (file.size === 0) return 'arquivo vazio'
  return null
}

function isDuplicate(file: File): boolean {
  return photos.value.some(
    (p) => p.file.name === file.name && p.file.size === file.size && p.file.lastModified === file.lastModified,
  )
}

async function createThumbnail(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file, { resizeWidth: THUMBNAIL_WIDTH, resizeQuality: 'low' })
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7))
    return blob ? URL.createObjectURL(blob) : null
  } catch {
    return null
  }
}

function queueThumbnail(key: number, file: File) {
  const owner = generation
  thumbnailQueue = thumbnailQueue.then(async () => {
    if (owner !== generation) return
    const url = await createThumbnail(file)
    const target = photos.value.find((p) => p.key === key)
    if (owner !== generation || !target) {
      if (url) URL.revokeObjectURL(url)
      return
    }
    target.thumbnail = url
  })
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement | null
  const files = Array.from(input?.files ?? [])
  if (input) input.value = ''
  const problems: string[] = []
  let ignoredByLimit = 0

  for (const file of files) {
    if (isDuplicate(file)) continue
    const reason = rejectionReason(file)
    if (reason) {
      problems.push(`${file.name}: ${reason}`)
      continue
    }
    if (photos.value.length >= MAX_PHOTOS) {
      ignoredByLimit += 1
      continue
    }
    const key = nextKey++
    photos.value.push({ key, file, thumbnail: null, title: titleFrom(file.name), state: 'pending', progress: 0 })
    queueThumbnail(key, file)
  }

  if (ignoredByLimit) problems.unshift(`Limite de ${MAX_PHOTOS} fotos por publicação: ${ignoredByLimit} ignorada(s).`)
  rejected.value = problems
}

function removePhoto(key: number) {
  const index = photos.value.findIndex((p) => p.key === key)
  const [removed] = index >= 0 ? photos.value.splice(index, 1) : []
  if (removed?.thumbnail) URL.revokeObjectURL(removed.thumbnail)
}

function close() {
  if (publishing.value) return
  newPostOpen.value = false
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

async function runWithConcurrency<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) await task(items[cursor++]!)
  })
  await Promise.all(workers)
}

function markFailed(photo: SelectedPhoto, err: unknown) {
  photo.state = 'error'
  photo.error = errorMessage(err)
}

async function register(batch: SelectedPhoto[]): Promise<Map<SelectedPhoto, PresignedUpload>> {
  const { data } = await photosApi.create(
    batch.map((photo) => ({
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
  const uploads = new Map<SelectedPhoto, PresignedUpload>()
  data.forEach((created, index) => {
    const photo = batch[index]
    if (!photo) return
    photo.photoId = created.photo.id
    uploads.set(photo, created.upload)
  })
  return uploads
}

async function sendFile(photo: SelectedPhoto, upload: PresignedUpload) {
  photo.state = 'uploading'
  photo.progress = 0
  photo.error = undefined
  try {
    await uploadToStorage(upload, photo.file, (fraction) => {
      photo.progress = fraction
    })
    await photosApi.confirmUpload(photo.photoId!)
    photo.state = 'done'
    photo.progress = 1
  } catch (err) {
    markFailed(photo, err)
  }
}

async function sendBatch(batch: SelectedPhoto[]) {
  let uploads: Map<SelectedPhoto, PresignedUpload>
  try {
    uploads = await register(batch)
  } catch (err) {
    batch.forEach((photo) => markFailed(photo, err))
    return
  }
  await runWithConcurrency(batch, PARALLEL_UPLOADS, async (photo) => {
    const upload = uploads.get(photo)
    if (upload) await sendFile(photo, upload)
  })
}

async function resend(photo: SelectedPhoto) {
  if (!photo.photoId) return sendBatch([photo])
  try {
    const { upload } = await photosApi.renewUploadUrl(photo.photoId)
    await sendFile(photo, upload)
  } catch (err) {
    markFailed(photo, err)
  }
}

async function publish() {
  if (!canPublish.value) return
  publishing.value = true
  formError.value = ''
  rejected.value = []
  const batches = chunk(photos.value, BATCH_SIZE)
  totalBatches.value = batches.length
  try {
    for (const [index, batch] of batches.entries()) {
      currentBatch.value = index + 1
      await sendBatch(batch)
    }
  } finally {
    publishing.value = false
    notifyPhotosChanged()
  }
}

async function retryFailed() {
  if (publishing.value || failed.value.length === 0) return
  publishing.value = true
  try {
    const unregistered = failed.value.filter((p) => !p.photoId)
    const registered = failed.value.filter((p) => p.photoId)
    for (const batch of chunk(unregistered, BATCH_SIZE)) await sendBatch(batch)
    await runWithConcurrency(registered, PARALLEL_UPLOADS, resend)
  } finally {
    publishing.value = false
    notifyPhotosChanged()
  }
}

async function retryOne(photo: SelectedPhoto) {
  if (publishing.value) return
  publishing.value = true
  try {
    await resend(photo)
  } finally {
    publishing.value = false
    notifyPhotosChanged()
  }
}

async function goToProfile() {
  newPostOpen.value = false
  await router.push('/perfil')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="newPostOpen" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4">
      <section class="my-6 w-full max-w-xl rounded-3xl bg-card p-6" role="dialog" aria-modal="true" aria-label="Nova publicação">
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
          <label v-if="!started" class="mt-5 block cursor-pointer">
            <span
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center transition hover:border-brand"
            >
              <ImagePlus class="size-6 text-muted" />
              <span class="text-sm font-semibold">Clique para escolher suas fotos</span>
              <span class="text-xs text-muted">
                JPG, PNG ou WEBP · até {{ MAX_FILE_MB }} MB cada · até {{ MAX_PHOTOS }} fotos, enviadas em lotes de
                {{ BATCH_SIZE }}
              </span>
            </span>
            <input type="file" :accept="ACCEPTED_TYPES.join(',')" multiple class="sr-only" @change="onFiles" />
          </label>

          <div v-if="rejected.length" class="mt-3 rounded-2xl bg-red-50 px-4 py-2.5 text-xs text-red-700">
            <p class="font-bold">Alguns arquivos não foram adicionados:</p>
            <ul class="mt-1 list-disc pl-4">
              <li v-for="problem in rejected.slice(0, 5)" :key="problem">{{ problem }}</li>
            </ul>
            <p v-if="rejected.length > 5" class="mt-1">e mais {{ rejected.length - 5 }}.</p>
          </div>

          <div v-if="started" class="mt-5 rounded-2xl bg-sub p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-bold">{{ doneCount }} de {{ photos.length }} enviadas</span>
              <span class="font-bold text-brand">{{ percent }}%</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div class="h-full rounded-full bg-brand transition-all" :style="{ width: `${percent}%` }" />
            </div>
            <p class="mt-2 text-xs text-muted">
              <template v-if="publishing">
                Lote {{ currentBatch }} de {{ totalBatches }} · Não feche esta janela até terminar.
              </template>
              <template v-else-if="failed.length">{{ failed.length }} foto(s) falharam.</template>
            </p>
          </div>

          <ul v-if="photos.length > 0" class="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            <li v-for="photo in photos" :key="photo.key" class="flex items-center gap-3 rounded-2xl bg-sub p-2">
              <img
                v-if="photo.thumbnail"
                :src="photo.thumbnail"
                :alt="photo.title"
                class="size-14 shrink-0 rounded-xl object-cover"
              />
              <span v-else class="grid size-14 shrink-0 place-items-center rounded-xl bg-line text-muted">
                <ImageIcon class="size-5" />
              </span>
              <div class="min-w-0 flex-1">
                <input
                  v-model="photo.title"
                  type="text"
                  maxlength="120"
                  placeholder="Título da foto"
                  :disabled="started"
                  class="w-full rounded-xl border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-brand"
                />
                <div v-if="photo.state === 'uploading'" class="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                  <div class="h-full bg-brand transition-all" :style="{ width: `${Math.round(photo.progress * 100)}%` }" />
                </div>
                <p v-else-if="photo.error" class="mt-1 truncate text-xs text-red-600" :title="photo.error">
                  {{ photo.error }}
                </p>
                <p v-else class="mt-1 text-xs text-muted">{{ formatSize(photo.file.size) }}</p>
              </div>
              <span v-if="photo.state === 'uploading'" class="w-9 text-right text-xs font-bold text-muted">
                {{ Math.round(photo.progress * 100) }}%
              </span>
              <CircleCheck v-else-if="photo.state === 'done'" class="size-5 shrink-0 text-emerald-600" />
              <button
                v-else-if="photo.state === 'error'"
                type="button"
                :aria-label="`Tentar enviar ${photo.title} de novo`"
                class="grid size-7 shrink-0 place-items-center rounded-full text-red-600 transition hover:bg-card disabled:opacity-40"
                :disabled="publishing"
                @click="retryOne(photo)"
              >
                <CircleAlert class="size-4" />
              </button>
              <span v-else-if="started" class="text-xs text-muted">na fila</span>
              <button
                v-else
                type="button"
                :aria-label="`Remover ${photo.title}`"
                class="grid size-7 shrink-0 place-items-center rounded-full text-ink/60 transition hover:text-brand"
                @click="removePhoto(photo.key)"
              >
                <X class="size-4" />
              </button>
            </li>
          </ul>

          <fieldset :disabled="started" class="mt-4 grid gap-3 disabled:opacity-60 sm:grid-cols-2">
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
            <textarea
              v-model="description"
              rows="3"
              maxlength="2000"
              placeholder="Escreva uma descrição para suas fotos..."
              class="w-full resize-none rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25 sm:col-span-2"
            />
          </fieldset>

          <p v-if="formError" class="mt-2 text-sm text-red-600">{{ formError }}</p>
          <p v-if="failed.length && !publishing" class="mt-2 text-sm text-muted">
            Tente de novo ou feche: as fotos já registradas ficam no seu perfil como "Aguardando envio".
          </p>

          <footer class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-full border border-line px-5 py-2 text-sm font-bold text-ink/70 transition hover:bg-sub disabled:opacity-40"
              :disabled="publishing"
              @click="close"
            >
              {{ started ? 'Fechar' : 'Cancelar' }}
            </button>
            <button
              v-if="failed.length && !publishing"
              type="button"
              class="flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:brightness-105"
              @click="retryFailed"
            >
              <RotateCcw class="size-4" />
              Tentar {{ failed.length }} de novo
            </button>
            <button
              v-else-if="!started"
              type="button"
              class="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canPublish"
              @click="publish"
            >
              Publicar {{ photos.length || '' }} foto(s)
            </button>
          </footer>
        </template>
      </section>
    </div>
  </Teleport>
</template>
