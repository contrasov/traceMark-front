<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronLeft, Moon, Sun } from '@lucide/vue'
import AppShell from '../components/AppShell.vue'
import { setTheme, theme, type Theme } from '../store/theme'

const options: { key: Theme; label: string; hint: string; icon: typeof Sun }[] = [
  { key: 'light', label: 'Claro', hint: 'O tema padrão do traceMark', icon: Sun },
  { key: 'dark', label: 'Full black', hint: 'Preto total, ideal para fotos', icon: Moon },
]
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao feed
    </RouterLink>

    <section class="rounded-3xl bg-card p-5 md:p-7">
      <h1 class="text-xl font-extrabold">Configurações</h1>
      <p class="mt-1 text-sm text-muted">Personalize a aparência do traceMark.</p>

      <h2 class="mt-6 text-xs font-bold tracking-wide text-muted uppercase">Aparência</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          v-for="option in options"
          :key="option.key"
          type="button"
          class="flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition"
          :class="theme === option.key ? 'border-brand ring-2 ring-brand/25' : 'border-line hover:border-brand/50'"
          @click="setTheme(option.key)"
        >
          <component :is="option.icon" class="mt-0.5 size-5 text-brand" />
          <span>
            <span class="block text-sm font-bold">{{ option.label }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{ option.hint }}</span>
          </span>
        </button>
      </div>
    </section>
  </AppShell>
</template>
