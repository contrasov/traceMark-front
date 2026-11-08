<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Aperture, Camera, ChevronLeft, Eye, EyeOff, Footprints } from '@lucide/vue'
import { errorMessage } from '../api/http'
import type { UserRole } from '../api/types'
import { login, register } from '../store/session'

const route = useRoute()
const router = useRouter()
const isRegister = computed(() => route.name === 'register')

const step = ref(1)
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole>('USER')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const roles: { key: UserRole; label: string; hint: string; icon: typeof Camera }[] = [
  { key: 'USER', label: 'Corredor', hint: 'Veja e comente as fotos', icon: Footprints },
  { key: 'PHOTOGRAPHER', label: 'Fotógrafo', hint: 'Publique suas fotos', icon: Camera },
]

watch(isRegister, () => {
  step.value = 1
  password.value = ''
  error.value = ''
})

function proceed() {
  if (!email.value.trim()) return
  error.value = ''
  step.value = 2
}

function back() {
  step.value = 1
  password.value = ''
  error.value = ''
}

async function submit(event: Event) {
  event.preventDefault()
  loading.value = true
  error.value = ''
  try {
    if (isRegister.value) {
      await register({ name: name.value.trim(), email: email.value.trim(), password: password.value, role: role.value })
    } else {
      await login(email.value.trim(), password.value)
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main
    class="flex min-h-svh items-center justify-center bg-page px-4 py-10 text-left"
  >
    <section class="w-full max-w-md">
      <div class="flex items-center justify-center">
        <span class="grid size-12 place-items-center rounded-2xl bg-brand text-white">
          <Aperture class="size-6" />
        </span>
      </div>
      <p class="mt-4 text-center text-xl font-extrabold tracking-tight text-ink">
        traceMark
      </p>

      <div class="mt-6 rounded-3xl border border-line bg-card p-7">
        <button
          v-if="!isRegister && step === 2"
          type="button"
          aria-label="Voltar"
          class="grid size-8 place-items-center rounded-full text-ink/70 transition hover:bg-sub"
          @click="back"
        >
          <ChevronLeft class="size-5" />
        </button>

        <h1 class="mt-1 text-2xl font-extrabold tracking-tight">
          <template v-if="isRegister">Criar sua conta</template>
          <template v-else>{{ step === 1 ? 'Entrar no traceMark' : 'Digite sua senha' }}</template>
        </h1>
        <p v-if="!isRegister && step === 2" class="mt-1 text-sm text-muted">
          Continue como <span class="font-semibold text-ink">{{ email }}</span>
        </p>

        <form class="mt-6 space-y-4" @submit="submit">
          <template v-if="isRegister">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="option in roles"
                :key="option.key"
                type="button"
                class="flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition"
                :class="role === option.key ? 'border-brand bg-brand-soft' : 'border-line hover:bg-sub'"
                @click="role = option.key"
              >
                <component :is="option.icon" class="size-5 text-brand" />
                <span class="text-sm font-bold">{{ option.label }}</span>
                <span class="text-xs text-muted">{{ option.hint }}</span>
              </button>
            </div>

            <label class="block cursor-text">
              <span class="mb-1.5 block text-xs font-bold tracking-wide text-muted uppercase">Nome</span>
              <input
                v-model="name"
                type="text"
                autocomplete="name"
                required
                minlength="2"
                maxlength="120"
                class="w-full rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </label>
          </template>

          <label v-if="isRegister || step === 1" class="group block cursor-text">
            <span
              class="mb-1.5 block text-xs font-bold tracking-wide text-muted uppercase"
            >
              E-mail
            </span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </label>

          <button
            v-if="!isRegister && step === 1"
            type="button"
            class="w-full rounded-full bg-ink py-3 text-sm font-bold text-page transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!email.trim()"
            @click="proceed"
          >
            Continuar
          </button>

          <template v-if="isRegister || step === 2">
            <label class="block cursor-text">
              <span class="mb-1.5 block text-xs font-bold tracking-wide text-muted uppercase">
                Senha
              </span>
              <span class="relative block">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                  required
                  :minlength="isRegister ? 8 : 1"
                  maxlength="128"
                  class="w-full rounded-2xl border border-line px-4 py-3 pr-11 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
                />
                <button
                  type="button"
                  aria-label="Mostrar senha"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
                  @click.prevent="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="size-4" />
                  <EyeOff v-else class="size-4" />
                </button>
              </span>
              <span v-if="isRegister" class="mt-1 block text-xs text-muted">Mínimo de 8 caracteres.</span>
            </label>

            <p v-if="error" class="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{{ error }}</p>

            <button
              type="submit"
              class="w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
              :disabled="loading"
            >
              {{ loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar' }}
            </button>
          </template>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-muted">
        <template v-if="isRegister">
          Já tem conta?
          <RouterLink to="/entrar" class="font-semibold text-brand hover:underline">Entre aqui</RouterLink>
        </template>
        <template v-else>
          Ainda não tem conta?
          <RouterLink to="/cadastro" class="font-semibold text-brand hover:underline">Crie uma aqui</RouterLink>
        </template>
      </p>
    </section>
  </main>
</template>
