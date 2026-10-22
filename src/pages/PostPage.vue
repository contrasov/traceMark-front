<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed, reactive, ref } from 'vue'
import { BadgeCheck, ChevronLeft, Send } from '@lucide/vue'
import AppShell from '../components/AppShell.vue'
import { findPost } from '../data/posts'
import type { Comment } from '../data/posts'
import { formatCount } from '../utils/count'

const route = useRoute()
const post = computed(() => findPost(Number(route.params.id)))

const drafts = reactive<Record<number, Comment[]>>({})
const comments = computed(() => drafts[post.value?.id ?? 0] ?? post.value?.comments ?? [])

const draftText = ref('')

function sendComment() {
  const text = draftText.value.trim()
  if (!text || !post.value) return
  const id = post.value.id
  if (!drafts[id]) drafts[id] = [...post.value.comments]
  drafts[id].push({
    id: Date.now(),
    author: 'Você',
    avatar: '🙂',
    time: 'agora',
    text,
    likes: 0,
  })
  draftText.value = ''
}
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao feed
    </RouterLink>

    <template v-if="post">      <article class="mt-4 rounded-3xl bg-card p-5 md:p-7">
        <header class="flex items-center gap-3">
          <span class="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-lg">
            {{ post.avatar }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 text-sm font-bold">
              {{ post.author }}
              <BadgeCheck v-if="post.verified" class="size-4 text-brand" aria-label="Verificado" />
            </p>
            <p class="text-xs text-muted">{{ post.date }} · {{ post.topic }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-brand px-4 py-1.5 text-xs font-bold text-brand transition hover:bg-brand-soft"
          >
            Seguir
          </button>
        </header>

        <h1 class="mt-5 text-2xl font-extrabold leading-tight md:text-3xl">{{ post.title }}</h1>

        <img
          v-if="post.image"
          :src="post.image"
          :alt="post.title"
          class="mt-5 w-full rounded-2xl object-cover"
        >
        <p v-if="post.imageInfo" class="mt-2 flex flex-wrap items-center gap-x-3 text-xs text-muted">
          <span class="font-semibold text-ink/70">{{ post.imageInfo.credit }}</span>
          <span>· {{ post.imageInfo.details }}</span>
        </p>

        <div class="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/85">
          <p v-for="(paragraph, i) in post.body" :key="i">{{ paragraph }}</p>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-2">
          <span
            v-for="(reaction, i) in post.reactions"
            :key="reaction.emoji"
            class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
            :class="i === 0 ? 'bg-brand-soft text-brand' : 'bg-sub text-ink/70'"
          >
            <span>{{ reaction.emoji }}</span>
            {{ formatCount(reaction.count) }}
          </span>
          <span class="size-7 rounded-full bg-sub text-center text-sm leading-7 text-ink/50">+</span>
        </div>

        <div class="mt-5 flex items-center gap-5 text-sm text-muted">
          <span class="flex items-center gap-1.5">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 3 6 8 6-8 3 18H3l3-18Z" />
            </svg>
            {{ post.marks }}
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m13 5 7 7-7 7v-4C7 15 4 18 2 19c1-5 4-10 11-10V5Z" />
            </svg>
          </span>
          <span class="ml-auto flex items-center gap-1.5">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            {{ formatCount(post.views) }}
          </span>
        </div>
      </article>

      <section class="mt-4 rounded-3xl bg-card p-5 md:p-7" aria-label="Comentários">
        <h2 class="text-lg font-extrabold">Comentários ({{ comments.length }})</h2>

        <form class="mt-4 flex items-center gap-2" @submit.prevent="sendComment">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft">🙂</span>
          <input
            v-model="draftText"
            type="text"
            placeholder="Escreva um comentário..."
            class="min-w-0 flex-1 rounded-full border border-line px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
          <button
            type="submit"
            class="flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
          >
            <Send class="size-4" />
            Comentar
          </button>
        </form>

        <ul class="mt-6 space-y-5">
          <li v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft">
              {{ comment.avatar }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 text-sm">
                <span class="font-bold">{{ comment.author }}</span>
                <span class="text-xs text-muted">{{ comment.time }}</span>
              </p>
              <p class="mt-0.5 text-sm leading-relaxed text-ink/85">{{ comment.text }}</p>
              <p class="mt-1 flex items-center gap-1 text-xs font-semibold text-muted">
                <span aria-hidden="true">♡</span>
                <span v-if="comment.likes > 0">{{ comment.likes }}</span>
              </p>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <div v-else class="mt-4 rounded-3xl bg-card p-10 text-center">
      <p class="text-2xl">🍂</p>
      <h1 class="mt-2 text-xl font-extrabold">Post não encontrado</h1>
      <p class="mt-1 text-sm text-muted">Ele pode ter sido apagado ou o endereço está errado.</p>
      <RouterLink
        to="/"
        class="mt-4 inline-block w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
      >
        Ir para o feed
      </RouterLink>
    </div>
  </AppShell>
</template>
