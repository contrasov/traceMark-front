import { onBeforeUnmount, onMounted } from 'vue'

const DEFAULT_INTERVAL_MS = Number(import.meta.env.VITE_POLLING_INTERVAL_MS ?? 10000)

export function usePolling(task: () => unknown, intervalMs = DEFAULT_INTERVAL_MS) {
  let timer: number | undefined

  function tick() {
    if (document.visibilityState === 'visible') Promise.resolve(task()).catch(() => undefined)
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') tick()
  }

  onMounted(() => {
    timer = window.setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
