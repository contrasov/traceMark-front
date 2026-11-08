<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { ChevronLeft, Send, Trash2 } from '@lucide/vue'
import { commentsApi } from '../api/comments'
import { ApiError, errorMessage } from '../api/http'
import { photosApi } from '../api/photos'
import type { Comment, PhotoDetails } from '../api/types'
import AppShell from '../components/AppShell.vue'
import PhotoImage from '../components/PhotoImage.vue'
import StateMessage from '../components/StateMessage.vue'
import UserAvatar from '../components/UserAvatar.vue'
import { usePolling } from '../composables/usePolling'
import { currentUser } from '../store/session'
import { formatDateTime, formatPrice, formatRelative, STATUS_CLASS, STATUS_LABEL } from '../utils/format'

const route = useRoute()
const photoId = computed(() => String(route.params.id))

const photo = ref<PhotoDetails | null>(null)
const comments = ref<Comment[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(true)
const notFound = ref(false)
const error = ref('')

const draftText = ref('')
const sending = ref(false)
const commentError = ref('')

const isOwner = computed(() => photo.value?.photographer.id === currentUser.value?.id)

async function load() {
  try {
    const details = await photosApi.get(photoId.value)
    photo.value = details
    comments.value = details.comments.data
    nextCursor.value = details.comments.nextCursor
    error.value = ''
  } catch (err) {
    notFound.value = err instanceof ApiError && err.status === 404
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

async function refreshWhileProcessing() {
  if (photo.value && photo.value.status !== 'PUBLISHABLE' && photo.value.status !== 'ERROR') await load()
}

async function loadMoreComments() {
  if (!nextCursor.value) return
  try {
    const page = await commentsApi.list(photoId.value, { cursor: nextCursor.value })
    comments.value.push(...page.data)
    nextCursor.value = page.nextCursor
  } catch (err) {
    commentError.value = errorMessage(err)
  }
}

async function sendComment() {
  const text = draftText.value.trim()
  if (!text) return
  sending.value = true
  commentError.value = ''
  try {
    const created = await commentsApi.create(photoId.value, text)
    if (!nextCursor.value) comments.value.push(created)
    draftText.value = ''
  } catch (err) {
    commentError.value = errorMessage(err)
  } finally {
    sending.value = false
  }
}

function canDelete(comment: Comment): boolean {
  return comment.author.id === currentUser.value?.id || isOwner.value
}

async function deleteComment(comment: Comment) {
  if (!confirm('Excluir este comentário?')) return
  try {
    await commentsApi.remove(comment.id)
    comments.value = comments.value.filter((item) => item.id !== comment.id)
  } catch (err) {
    commentError.value = errorMessage(err)
  }
}

watch(
  photoId,
  () => {
    loading.value = true
    notFound.value = false
    load()
  },
  { immediate: true },
)
usePolling(refreshWhileProcessing, 5000)
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao mural
    </RouterLink>

    <StateMessage v-if="loading" title="Carregando a foto..." />

    <StateMessage
      v-else-if="!photo"
      :title="notFound ? 'Foto não encontrada' : 'Não foi possível carregar a foto'"
      :description="notFound ? 'Ela pode ainda estar em processamento ou o endereço está errado.' : error"
      :tone="notFound ? 'neutral' : 'error'"
    >
      <RouterLink
        to="/"
        class="mt-4 inline-block w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
      >
        Ir para o mural
      </RouterLink>
    </StateMessage>

    <template v-else>
      <article class="mt-4 rounded-3xl bg-card p-5 md:p-7">
        <header class="flex items-center gap-3">
          <RouterLink :to="`/usuarios/${photo.photographer.id}`">
            <UserAvatar :name="photo.photographer.name" size="lg" />
          </RouterLink>
          <div class="min-w-0 flex-1">
            <RouterLink :to="`/usuarios/${photo.photographer.id}`" class="text-sm font-bold hover:underline">
              {{ photo.photographer.name }}
            </RouterLink>
            <p class="text-xs text-muted">
              {{ photo.publishedAt ? `Publicada em ${formatDateTime(photo.publishedAt)}` : `Enviada em ${formatDateTime(photo.createdAt)}` }}
            </p>
          </div>
          <span
            v-if="photo.status !== 'PUBLISHABLE'"
            class="rounded-full px-3 py-1 text-xs font-bold"
            :class="STATUS_CLASS[photo.status]"
          >
            {{ STATUS_LABEL[photo.status] }}
          </span>
        </header>

        <h1 class="mt-5 text-2xl font-extrabold leading-tight md:text-3xl">{{ photo.title }}</h1>

        <PhotoImage :photo="photo" class="mt-5" />

        <p v-if="photo.description" class="mt-5 text-[15px] leading-relaxed text-ink/85">{{ photo.description }}</p>

        <dl class="mt-6 grid gap-3 rounded-2xl bg-sub p-4 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-xs font-bold tracking-wide text-muted uppercase">Preço</dt>
            <dd class="text-lg font-extrabold text-brand">{{ formatPrice(photo.price) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-bold tracking-wide text-muted uppercase">Fotógrafo</dt>
            <dd class="font-semibold">{{ photo.photographer.name }}</dd>
          </div>
          <div v-if="photo.eventName">
            <dt class="text-xs font-bold tracking-wide text-muted uppercase">Corrida</dt>
            <dd class="font-semibold">{{ photo.eventName }}</dd>
          </div>
          <div v-if="photo.takenAt">
            <dt class="text-xs font-bold tracking-wide text-muted uppercase">Registrada em</dt>
            <dd class="font-semibold">{{ formatDateTime(photo.takenAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-bold tracking-wide text-muted uppercase">Versão exibida</dt>
            <dd class="font-semibold">
              {{ photo.image?.variant === 'ORIGINAL' ? 'Original (você é o fotógrafo)' : 'Com marca-d\'água' }}
            </dd>
          </div>
          <div v-if="isOwner && photo.processingError">
            <dt class="text-xs font-bold tracking-wide text-muted uppercase">Erro no processamento</dt>
            <dd class="font-semibold text-red-600">{{ photo.processingError }}</dd>
          </div>
        </dl>
      </article>

      <section class="mt-4 rounded-3xl bg-card p-5 md:p-7" aria-label="Comentários">
        <h2 class="text-lg font-extrabold">Comentários</h2>

        <form v-if="photo.status === 'PUBLISHABLE' || isOwner" class="mt-4 flex items-center gap-2" @submit.prevent="sendComment">
          <UserAvatar v-if="currentUser" :name="currentUser.name" />
          <input
            v-model="draftText"
            type="text"
            maxlength="1000"
            placeholder="Escreva um comentário..."
            class="min-w-0 flex-1 rounded-full border border-line px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
          <button
            type="submit"
            class="flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50"
            :disabled="sending || !draftText.trim()"
          >
            <Send class="size-4" />
            Comentar
          </button>
        </form>
        <p v-if="commentError" class="mt-3 text-sm text-red-600">{{ commentError }}</p>

        <p v-if="comments.length === 0" class="mt-6 text-sm text-muted">Nenhum comentário ainda. Seja o primeiro!</p>

        <ul class="mt-6 space-y-5">
          <li v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
            <UserAvatar :name="comment.author.name" />
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 text-sm">
                <RouterLink :to="`/usuarios/${comment.author.id}`" class="font-bold hover:underline">
                  {{ comment.author.name }}
                </RouterLink>
                <span class="text-xs text-muted">{{ formatRelative(comment.createdAt) }}</span>
              </p>
              <p class="mt-0.5 text-sm leading-relaxed whitespace-pre-line text-ink/85">{{ comment.content }}</p>
            </div>
            <button
              v-if="canDelete(comment)"
              type="button"
              aria-label="Excluir comentário"
              class="grid size-8 place-items-center rounded-full text-muted transition hover:bg-sub hover:text-red-600"
              @click="deleteComment(comment)"
            >
              <Trash2 class="size-4" />
            </button>
          </li>
        </ul>

        <button
          v-if="nextCursor"
          type="button"
          class="mt-6 w-full rounded-full border border-line py-2.5 text-sm font-bold text-ink/70 transition hover:bg-sub"
          @click="loadMoreComments"
        >
          Ver mais comentários
        </button>
      </section>
    </template>
  </AppShell>
</template>
