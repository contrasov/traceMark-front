<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { ChevronLeft } from '@lucide/vue'
import { ApiError, errorMessage } from '../api/http'
import type { PublicUser } from '../api/types'
import { usersApi } from '../api/users'
import AppShell from '../components/AppShell.vue'
import ProfileHeader from '../components/ProfileHeader.vue'
import StateMessage from '../components/StateMessage.vue'
import { currentUser } from '../store/session'

const route = useRoute()
const router = useRouter()
const userId = computed(() => String(route.params.id))

const user = ref<PublicUser | null>(null)
const loading = ref(true)
const error = ref('')

watch(
  userId,
  async (id) => {
    if (id === currentUser.value?.id) {
      await router.replace('/perfil')
      return
    }
    loading.value = true
    try {
      user.value = await usersApi.get(id)
      error.value = ''
    } catch (err) {
      user.value = null
      error.value = err instanceof ApiError && err.status === 404 ? 'Usuário não encontrado.' : errorMessage(err)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao mural
    </RouterLink>

    <StateMessage v-if="loading" class="mt-4" title="Carregando perfil..." />
    <StateMessage v-else-if="!user" class="mt-4" title="Perfil indisponível" :description="error" tone="error" />
    <ProfileHeader v-else :user="user" />
  </AppShell>
</template>
