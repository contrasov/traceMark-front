<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel?: string
    busyLabel?: string
    busy?: boolean
    error?: string
    tone?: 'brand' | 'danger'
  }>(),
  { confirmLabel: 'Confirmar', busyLabel: 'Aguarde...', busy: false, error: '', tone: 'brand' },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()

function cancel() {
  if (!props.busy) emit('cancel')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') cancel()
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      @click.self="cancel"
    >
      <section class="w-full max-w-md rounded-3xl bg-card p-6" role="dialog" aria-modal="true" :aria-label="title">
        <header class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-extrabold">{{ title }}</h2>
          <button
            type="button"
            aria-label="Fechar"
            class="grid size-8 shrink-0 place-items-center rounded-full text-ink/70 transition hover:bg-sub disabled:opacity-40"
            :disabled="busy"
            @click="cancel"
          >
            <X class="size-5" />
          </button>
        </header>

        <div class="mt-4 text-sm text-ink/85">
          <slot />
        </div>

        <p v-if="error" class="mt-4 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{{ error }}</p>

        <footer class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-full border border-line px-5 py-2 text-sm font-bold text-ink/70 transition hover:bg-sub disabled:opacity-40"
            :disabled="busy"
            @click="cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50"
            :class="tone === 'danger' ? 'bg-red-600' : 'bg-brand'"
            :disabled="busy"
            @click="emit('confirm')"
          >
            {{ busy ? busyLabel : confirmLabel }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>
