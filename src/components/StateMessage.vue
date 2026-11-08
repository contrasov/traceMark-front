<script setup lang="ts">
defineProps<{ title: string; description?: string; tone?: 'neutral' | 'error' }>()
</script>

<template>
  <div class="rounded-3xl bg-card p-10 text-center" :class="tone === 'error' ? 'text-red-700' : ''">
    <h2 class="text-lg font-extrabold">{{ title }}</h2>
    <p v-if="description" class="mt-1 text-sm" :class="tone === 'error' ? 'text-red-600' : 'text-muted'">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
