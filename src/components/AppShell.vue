<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppWidgets from './AppWidgets.vue'

const HEADER_OFFSET = 72

const leftEl = ref<HTMLElement | null>(null)
const rightEl = ref<HTMLElement | null>(null)
const leftTop = ref(HEADER_OFFSET)
const rightTop = ref(HEADER_OFFSET)

function updateSticky() {
  calcTop(leftEl.value, leftTop)
  calcTop(rightEl.value, rightTop)
}

function calcTop(el: HTMLElement | null, target: Ref<number>) {
  if (!el) return
  target.value = Math.min(HEADER_OFFSET, window.innerHeight - el.offsetHeight)
}

let observer: ResizeObserver | undefined

onMounted(() => {
  updateSticky()
  observer = new ResizeObserver(updateSticky)
  if (leftEl.value) observer.observe(leftEl.value)
  if (rightEl.value) observer.observe(rightEl.value)
  window.addEventListener('resize', updateSticky)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', updateSticky)
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-[1240px] gap-5 px-4 py-5 md:px-6">
    <aside class="hidden w-64 shrink-0 self-stretch xl:block" aria-label="Navegação">
      <div ref="leftEl" class="sticky pb-4" :style="{ top: `${leftTop}px` }">
        <AppSidebar />
      </div>
    </aside>

    <main class="min-w-0 flex-1 space-y-4">
      <slot />
    </main>

    <div class="hidden w-[300px] shrink-0 self-stretch lg:block">
      <div ref="rightEl" class="sticky pb-4" :style="{ top: `${rightTop}px` }">
        <AppWidgets />
      </div>
    </div>
  </div>
</template>
