<script setup lang="ts">
import { BadgeCheck, Camera, Eye, MessageCircle } from '@lucide/vue'
import { formatCount } from '../utils/count'
import { popularPhotographers, popularQuestions } from '../data/posts'
</script>

<template>
  <aside class="space-y-4 text-sm" aria-label="Painel lateral">
    <div class="rounded-2xl bg-[#fbf1f6] p-4">
      <h3 class="font-bold text-ink">Próximas corridas</h3>
      <p class="mt-1.5 text-[13px] text-ink/70">
        Confira as corridas de rua da sua região antes que elas passem por você.
      </p>
      <a href="#" class="mt-2 inline-block font-semibold text-brand hover:underline">
        Ver calendário
      </a>
    </div>

    <div class="rounded-2xl bg-card p-4">
      <h3 class="mb-3 font-bold text-ink">Populares dos fotógrafos</h3>
      <ul class="space-y-4">
        <li v-for="tip in popularPhotographers" :key="tip.text">
          <article>
            <header class="flex items-center gap-2">
              <span class="grid size-6 place-items-center rounded-full bg-brand-soft text-xs">
                {{ tip.avatar }}
              </span>
              <span class="text-[13px] font-semibold">{{ tip.author }}</span>
              <BadgeCheck class="size-3.5 text-brand" aria-label="Verificado" />
            </header>
            <p class="mt-1 text-[13px] leading-snug text-ink/80">{{ tip.text }}</p>
            <p class="mt-1 flex items-center gap-1 text-xs text-muted">
              <Eye class="size-3.5" />
              {{ formatCount(tip.views) }}
            </p>
          </article>
        </li>
      </ul>
    </div>

    <div class="rounded-2xl bg-card p-4">
      <h3 class="mb-3 font-bold text-ink">Perguntas populares</h3>
      <ul class="space-y-4">
        <li v-for="q in popularQuestions" :key="q.comments">
          <article>
            <header class="flex items-center gap-2">
              <span class="grid size-6 place-items-center rounded-full bg-brand-soft text-xs">
                {{ q.avatar }}
              </span>
              <span class="text-[13px] font-semibold">{{ q.author }}</span>
            </header>
            <p class="mt-1 line-clamp-3 text-[13px] leading-snug text-ink/80">{{ q.text }}</p>
            <p class="mt-1 flex items-center gap-1 text-xs text-muted">
              <MessageCircle class="size-3.5" />
              {{ q.comments }}
            </p>
          </article>
        </li>
      </ul>
      <button
        type="button"
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-acid py-2.5 text-center text-[13px] font-bold text-[#16161d] transition hover:brightness-105"
      >
        <Camera class="size-4" />
        Pedir fotos da corrida
      </button>
    </div>
  </aside>
</template>
