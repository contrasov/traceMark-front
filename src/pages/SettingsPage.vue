<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { ref } from 'vue'
import { ChevronLeft, LogOut, Moon, Sun } from '@lucide/vue'
import { errorMessage } from '../api/http'
import { usersApi } from '../api/users'
import AppShell from '../components/AppShell.vue'
import { currentUser, logout, updateCurrentUser } from '../store/session'
import { setTheme, theme, type Theme } from '../store/theme'

const options: { key: Theme; label: string; hint: string; icon: typeof Sun }[] = [
  { key: 'light', label: 'Claro', hint: 'O tema padrão do traceMark', icon: Sun },
  { key: 'dark', label: 'Full black', hint: 'Preto total, ideal para fotos', icon: Moon },
]

const router = useRouter()
const name = ref(currentUser.value?.name ?? '')
const bio = ref(currentUser.value?.bio ?? '')
const saving = ref(false)
const message = ref('')
const error = ref('')

async function save() {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    updateCurrentUser(await usersApi.updateMe({ name: name.value.trim(), bio: bio.value.trim() || null }))
    message.value = 'Perfil atualizado.'
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}

async function signOut() {
  logout()
  await router.replace('/entrar')
}
</script>

<template>
  <AppShell>
    <RouterLink
      to="/"
      class="flex w-fit items-center gap-1.5 rounded-full text-sm font-semibold text-muted transition hover:text-ink"
    >
      <ChevronLeft class="size-4" /> Voltar ao mural
    </RouterLink>

    <section class="rounded-3xl bg-card p-5 md:p-7">
      <h1 class="text-xl font-extrabold">Configurações</h1>

      <h2 class="mt-6 text-xs font-bold tracking-wide text-muted uppercase">Perfil</h2>
      <form class="mt-3 space-y-3" @submit.prevent="save">
        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Nome</span>
          <input
            v-model="name"
            type="text"
            required
            minlength="2"
            maxlength="120"
            class="w-full rounded-2xl border border-line px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label class="block">
          <span class="mb-1 block text-sm font-semibold">Bio</span>
          <textarea
            v-model="bio"
            rows="3"
            maxlength="500"
            class="w-full resize-none rounded-2xl border border-line px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <div class="flex items-center gap-3">
          <button
            type="submit"
            class="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
          <span v-if="message" class="text-sm text-emerald-600">{{ message }}</span>
          <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        </div>
      </form>

      <h2 class="mt-8 text-xs font-bold tracking-wide text-muted uppercase">Aparência</h2>
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

      <button
        type="button"
        class="mt-8 flex items-center gap-2 rounded-full border border-line px-5 py-2 text-sm font-bold text-red-600 transition hover:bg-sub"
        @click="signOut"
      >
        <LogOut class="size-4" /> Sair da conta
      </button>
    </section>
  </AppShell>
</template>
