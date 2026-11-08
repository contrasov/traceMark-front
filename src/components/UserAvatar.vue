<script setup lang="ts">
import { computed } from 'vue'
import { initials } from '../utils/format'

const props = withDefaults(defineProps<{ name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>(), { size: 'md' })

const sizeClass = computed(
  () =>
    ({
      sm: 'size-8 text-xs',
      md: 'size-10 text-sm',
      lg: 'size-12 text-base',
      xl: 'size-20 text-2xl border-4 border-card',
    })[props.size],
)
</script>

<template>
  <span
    class="grid shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand"
    :class="sizeClass"
    aria-hidden="true"
  >
    {{ initials(name) }}
  </span>
</template>
