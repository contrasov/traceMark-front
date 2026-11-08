<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Camera } from '@lucide/vue'
import { newPostOpen } from '../store/feed'
import { currentUser, isPhotographer } from '../store/session'
import UserAvatar from './UserAvatar.vue'
</script>

<template>
  <aside class="space-y-4 text-sm" aria-label="Painel lateral">
    <RouterLink v-if="currentUser" to="/perfil" class="flex items-center gap-3 rounded-2xl bg-card p-4">
      <UserAvatar :name="currentUser.name" />
      <span class="min-w-0">
        <span class="block truncate font-bold">{{ currentUser.name }}</span>
        <span class="block text-xs text-muted">{{ isPhotographer ? 'Fotógrafo' : 'Corredor' }}</span>
      </span>
    </RouterLink>

    <div class="rounded-2xl bg-card p-4">
      <h3 class="font-bold text-ink">Como funciona</h3>
      <ol class="mt-2 list-decimal space-y-1.5 pl-4 text-[13px] text-ink/75">
        <li>O fotógrafo envia as fotos da corrida.</li>
        <li>A plataforma aplica a marca-d'água automaticamente.</li>
        <li>As fotos aparecem no mural, com preço e comentários.</li>
      </ol>
      <p class="mt-3 text-xs text-muted">
        {{
          isPhotographer
            ? 'Você vê as suas fotos originais; os demais usuários veem a versão com marca-d\'água.'
            : 'Você vê a versão com marca-d\'água de cada foto.'
        }}
      </p>
      <button
        v-if="isPhotographer"
        type="button"
        class="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2 text-sm font-bold text-white transition hover:brightness-105"
        @click="newPostOpen = true"
      >
        <Camera class="size-4" />
        Publicar fotos
      </button>
    </div>
  </aside>
</template>
