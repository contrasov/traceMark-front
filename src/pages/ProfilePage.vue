<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BadgeCheck, ChevronLeft } from '@lucide/vue'
import AppShell from '../components/AppShell.vue'
import PostCard from '../components/PostCard.vue'
import { formatCount } from '../utils/count'
import { currentUser, postsByAuthor } from '../data/posts'

const myPosts = postsByAuthor(currentUser.handle)
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao feed
    </RouterLink>

    <section class="mt-4 overflow-hidden rounded-3xl bg-card">
      <div class="h-32 bg-brand md:h-40" aria-hidden="true" />

      <div class="p-5 md:p-7 md:pt-0">
        <div class="-mt-9 flex items-end gap-4">
          <span
            class="grid size-20 shrink-0 place-items-center rounded-3xl border-4 border-card bg-brand-soft text-4xl md:size-24"
          >
            {{ currentUser.avatar }}
          </span>
          <button
            type="button"
            class="ml-auto mb-1 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
          >
            Seguir
          </button>
        </div>

        <h1 class="mt-3 flex items-center gap-2 text-2xl font-extrabold">
          {{ currentUser.name }}
          <BadgeCheck v-if="currentUser.verified" class="size-5 text-brand" aria-label="Verificado" />
        </h1>
        <p class="text-sm text-muted">
          {{ currentUser.handle }} · {{ currentUser.city }} · {{ currentUser.joined }}
        </p>
        <p class="mt-2 text-sm leading-relaxed text-ink/85">{{ currentUser.bio }}</p>

        <dl class="mt-4 flex divide-x divide-line text-sm">
          <div class="flex-1 text-center">
            <dt class="text-muted text-xs">Publicações</dt>
            <dd class="font-extrabold">{{ currentUser.stats.posts }}</dd>
          </div>
          <div class="flex-1 text-center">
            <dt class="text-muted text-xs">Seguidores</dt>
            <dd class="font-extrabold">{{ formatCount(currentUser.stats.followers) }}</dd>
          </div>
          <div class="flex-1 text-center">
            <dt class="text-muted text-xs">Seguindo</dt>
            <dd class="font-extrabold">{{ currentUser.stats.following }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <h2 class="mt-6 mb-3 text-lg font-extrabold">Publicações</h2>
    <div class="space-y-4">
      <PostCard v-for="post in myPosts" :key="post.id" :post="post" />
      <p v-if="myPosts.length === 0" class="rounded-2xl bg-card p-8 text-center text-sm text-muted">
        Nenhuma publicação ainda.
      </p>
    </div>
  </AppShell>
</template>
