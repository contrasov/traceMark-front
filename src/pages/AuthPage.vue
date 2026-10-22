<script setup lang="ts">
import { ref } from 'vue'
import { Aperture, ChevronLeft, Eye, EyeOff } from '@lucide/vue'

const step = ref(1)
const identifier = ref('')
const password = ref('')
const showPassword = ref(false)

function proceed() {
  if (!identifier.value.trim()) return
  step.value = 2
}

function back() {
  step.value = 1
  password.value = ''
}

function submit(auth: Event) {
  auth.preventDefault()
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
          v-if="step === 2"
          type="button"
          aria-label="Voltar"
          class="grid size-8 place-items-center rounded-full text-ink/70 transition hover:bg-sub"
          @click="back"
        >
          <ChevronLeft class="size-5" />
        </button>

        <h1 class="mt-1 text-2xl font-extrabold tracking-tight">
          {{ step === 1 ? 'Entrar no traceMark' : 'Digite sua senha' }}
        </h1>
        <p v-if="step === 2" class="mt-1 text-sm text-muted">
          Continue como <span class="font-semibold text-ink">{{ identifier }}</span>
        </p>

        <form class="mt-6 space-y-4" @submit="submit">
          <template v-if="step === 1">
            <label class="group block cursor-text">
              <span
                class="mb-1.5 block text-xs font-bold tracking-wide text-muted uppercase"
              >
                Nome de usuário ou e-mail
              </span>
              <input
                v-model="identifier"
                type="text"
                autocomplete="username"
                required
                class="w-full rounded-2xl border border-line px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </label>

            <button
              type="button"
              class="w-full rounded-full bg-ink py-3 text-sm font-bold text-page transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!identifier.trim()"
              @click="proceed"
            >
              Continuar
            </button>

            <p class="text-center text-sm">
              <a href="#" class="font-semibold text-brand hover:underline">
                Esqueceu sua senha?
              </a>
           </p>
          </template>

          <template v-else>
            <label class="block cursor-text">
              <span class="mb-1.5 block text-xs font-bold tracking-wide text-muted uppercase">
                Senha
              </span>
              <span class="relative block">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
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
            </label>

            <button
              type="submit"
              class="w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:brightness-105"
            >
              Entrar
            </button>

            <p class="text-center text-sm">
              <a href="#" class="font-semibold text-brand hover:underline">
                Esqueceu sua senha?
              </a>
            </p>
          </template>
        </form>
      </div>

      <p class="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?
        <a href="#" class="font-semibold text-brand hover:underline">Crie uma aqui</a>
      </p>
    </section>
  </main>
</template>
