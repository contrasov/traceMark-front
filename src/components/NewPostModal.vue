<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImagePlus, X } from '@lucide/vue'
import { feedPosts, newPostOpen } from '../store/feed'
import { addLocalPost, currentUser } from '../data/posts'
import type { Post } from '../data/posts'

const MAX_PHOTOS = 8

const description = ref('')
const photos = ref<{ url: string; name: string }[]>([])

const canPublish = computed(() => photos.value.length > 0)

watch(newPostOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) reset()
})

function reset() {
  description.value = ''
  photos.value.forEach((p) => URL.revokeObjectURL(p.url))
  photos.value = []
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement | null
  const files = input?.files
  if (!files) return
  for (const file of Array.from(files)) {
    if (photos.value.length >= MAX_PHOTOS) break
    if (!file.type.startsWith('image/')) continue
    photos.value.push({ url: URL.createObjectURL(file), name: file.name })
  }
  if (input) input.value = ''
}

function removePhoto(index: number) {
  URL.revokeObjectURL(photos.value[index].url)
  photos.value.splice(index, 1)
}

function close() {
  newPostOpen.value = false
}

function publish() {
  if (!canPublish.value) return
  const text = description.value.trim()
  const post: Post = {
    id: Date.now(),
    author: currentUser.name,
    handle: currentUser.handle,
    avatar: currentUser.avatar,
    verified: currentUser.verified,
    time: 'agora',
    date: 'agora',
    topic: 'Fotógrafos',
    title: text || 'Fotos da corrida',
    excerpt: text || 'Novas fotos publicadas no traceMark.',
    body: [text || 'Novas fotos publicadas no traceMark.'],
    image: photos.value[0].url,
    imageInfo: {
      credit: `Foto: ${currentUser.name}`,
      details: photos.value[0].name,
    },
    reactions: [],
    comments: [],
    marks: 0,
    views: 1,
  }
  addLocalPost(post)
  feedPosts.value.unshift(post)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="newPostOpen"
      class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      @click.self="close"
    >
      <section class="w-full max-w-lg rounded-3xl bg-card p-6" aria-label="Nova publicação">
        <header class="flex items-center justify-between">
          <h2 class="text-lg font-extrabold">Nova publicação</h2>
          <button
            type="button"
            aria-label="Fechar"
            class="grid size-8 place-items-center rounded-full text-ink/70 transition hover:bg-sub"
            @click="close"
          >
            <X class="size-5" />
          </button>
        </header>

        <label class="mt-5 block cursor-pointer">
          <span
            class="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center transition hover:border-brand"
          >
            <ImagePlus class="size-6 text-muted" />
            <span class="text-sm font-semibold">Clique para escolher suas fotos</span>
            <span class="text-xs text-muted">PNG ou JPG · até {{ MAX_PHOTOS }} fotos</span>
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            class="sr-only"
            @change="onFiles"
          />
        </label>

        <ul v-if="photos.length > 0" class="mt-4 grid grid-cols-4 gap-2">
          <li v-for="(photo, i) in photos" :key="photo.url" class="relative">
            <img
              :src="photo.url"
              :alt="photo.name"
              class="aspect-square w-full rounded-xl object-cover"
            />
            <button
              type="button"
              :aria-label="`Remover ${photo.name}`"
              class="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-card/90 text-ink/70 transition hover:text-brand"
              @click="removePhoto(i)"
            >
              <X class="size-3.5" />
            </button>
          </li>
        </ul>

        <textarea
          v-model="description"
          rows="4"
          maxlength="500"
          placeholder="Escreva uma descrição para suas fotos..."
          class="mt-4 w-full resize-none rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
        />

        <footer class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-full border border-line px-5 py-2 text-sm font-bold text-ink/70 transition hover:bg-sub"
            @click="close"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canPublish"
            @click="publish"
          >
            Publicar
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
