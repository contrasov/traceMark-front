<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { onMounted, ref } from 'vue'
import { ChevronLeft, Download } from '@lucide/vue'
import { errorMessage } from '../api/http'
import { downloadOriginal, purchasesApi } from '../api/purchases'
import type { PurchasedPhoto } from '../api/types'
import AppShell from '../components/AppShell.vue'
import PostCard from '../components/PostCard.vue'
import StateMessage from '../components/StateMessage.vue'
import { formatDateTime, formatPrice } from '../utils/format'

const purchases = ref<PurchasedPhoto[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(true)
const error = ref('')
const downloadingId = ref<string | null>(null)

async function load(append = false) {
  try {
    const page = await purchasesApi.mine({ limit: 10, cursor: append ? nextCursor.value : null })
    purchases.value = append ? [...purchases.value, ...page.data] : page.data
    nextCursor.value = page.nextCursor
    error.value = ''
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

async function download(photoId: string) {
  downloadingId.value = photoId
  error.value = ''
  try {
    await downloadOriginal(photoId)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    downloadingId.value = null
  }
}

onMounted(() => load())
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao mural
    </RouterLink>

    <h1 class="mt-4 mb-3 text-lg font-extrabold">Minhas compras</h1>

    <p v-if="error" class="mb-3 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{{ error }}</p>

    <div class="space-y-4">
      <StateMessage v-if="loading" title="Carregando suas compras..." />
      <StateMessage
        v-else-if="purchases.length === 0"
        title="Nenhuma compra ainda"
        description="Abra uma foto do mural e use o botão “Comprar” para baixar a original."
      />
      <div v-for="item in purchases" :key="item.id">
        <PostCard :photo="item.photo" />
        <div class="mt-2 flex flex-wrap items-center gap-3 rounded-2xl bg-card px-4 py-2.5">
          <p class="mr-auto text-xs text-muted">
            Comprada em {{ formatDateTime(item.purchasedAt) }} por
            <span class="font-bold text-ink">{{ formatPrice(item.price) }}</span>
          </p>
          <button
            type="button"
            class="flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-page transition hover:opacity-90 disabled:opacity-50"
            :disabled="downloadingId !== null"
            @click="download(item.photoId)"
          >
            <Download class="size-4" />
            {{ downloadingId === item.photoId ? 'Gerando link...' : 'Baixar original' }}
          </button>
        </div>
      </div>
      <button
        v-if="nextCursor"
        type="button"
        class="w-full rounded-full border border-line bg-card py-3 text-sm font-bold text-ink/70 transition hover:bg-sub"
        @click="load(true)"
      >
        Carregar mais
      </button>
    </div>
  </AppShell>
</template>
