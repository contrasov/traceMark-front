<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '../components/AppShell.vue'
import PostCard from '../components/PostCard.vue'
import { feedPosts } from '../store/feed'

const tabs = ['Novo', 'Populares', 'Debates']
const activeTab = ref('Novo')
</script>

<template>
  <AppShell>
    <div class="sticky top-[64px] z-20 -my-2 bg-page py-2">
      <div class="flex w-fit gap-0.5 rounded-2xl bg-card p-2">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="rounded-full px-4 py-1.5 text-sm font-bold transition"
          :class="activeTab === tab ? 'bg-acid text-[#16161d]' : 'text-ink/60 hover:text-ink'"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <PostCard v-for="post in feedPosts" :key="post.id" :post="post" />
  </AppShell>
</template>
