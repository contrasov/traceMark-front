<script setup lang="ts">
import { BadgeCheck, Bookmark, Ellipsis, Eye, MessageCircle, Share2 } from '@lucide/vue'
import { formatCount } from '../utils/count'
import type { Post } from '../data/posts'

const props = defineProps<{ post: Post }>()

const isLogo = props.post.handle === '@tracemark'
</script>

<template>
  <router-link
    :to="`/post/${post.id}`"
    class="block rounded-3xl bg-card p-5 transition hover:brightness-[0.99]"
  >
    <div class="flex items-start gap-3">
      <span
        class="grid size-12 shrink-0 place-items-center rounded-full text-lg"
        :class="isLogo ? 'bg-brand font-black text-white' : 'bg-brand-soft'"
      >
        {{ post.avatar }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-1.5 text-sm font-bold">
          {{ post.author }}
          <BadgeCheck v-if="post.verified" class="size-4 text-brand" />
        </p>
        <p class="text-xs text-muted">{{ post.time }} · {{ post.topic }}</p>
      </div>
      <button
        type="button"
        class="rounded-full border border-brand px-4 py-1.5 text-xs font-bold text-brand transition hover:bg-brand-soft"
        @click.prevent
      >
        Seguir
      </button>
      <button
        type="button"
        aria-label="Mais opções"
        class="px-1 text-muted"
        @click.prevent
      >
        <Ellipsis class="size-5" />
      </button>
    </div>

    <h2 class="mt-4 text-left text-xl leading-snug font-extrabold">
      {{ post.title }}
    </h2>
    <p class="mt-2 text-left text-[15px] leading-relaxed text-ink/80">
      {{ post.excerpt }}
      <span class="font-bold text-brand"> Leia mais</span>
    </p>

    <img
      v-if="post.image"
      :src="post.image"
      :alt="post.title"
      class="mt-4 aspect-[16/9] w-full rounded-2xl object-cover"
    >

    <div class="mt-4 flex flex-wrap items-center gap-2">
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

    <div class="mt-4 flex items-center gap-5 text-sm text-muted">
      <span class="flex items-center gap-1.5">
        <MessageCircle class="size-4" />
        {{ post.comments.length }}
      </span>
      <span class="flex items-center gap-1.5">
        <Bookmark class="size-4" />
        {{ post.marks }}
      </span>
      <span class="flex items-center gap-1.5">
        <Share2 class="size-4" />
      </span>
      <span class="ml-auto flex items-center gap-1.5">
        <Eye class="size-4" />
        {{ formatCount(post.views) }}
      </span>
    </div>
  </router-link>
</template>
