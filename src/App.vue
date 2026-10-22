<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import NewPostModal from './components/NewPostModal.vue'

const route = useRoute()
const showHeader = computed(() => route.name !== 'login')
</script>

<template>
  <AppHeader v-if="showHeader" />
  <RouterView />
  <NewPostModal />
</template>
