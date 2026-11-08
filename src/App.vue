<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import NewPostModal from './components/NewPostModal.vue'
import { isAuthenticated, isPhotographer } from './store/session'

const route = useRoute()
const showHeader = computed(() => isAuthenticated.value && !route.meta.guestOnly)
</script>

<template>
  <AppHeader v-if="showHeader" />
  <RouterView />
  <NewPostModal v-if="isPhotographer" />
</template>
