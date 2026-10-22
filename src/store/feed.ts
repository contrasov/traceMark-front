import { ref } from 'vue'
import type { Post } from '../data/posts'
import { posts } from '../data/posts'

export const newPostOpen = ref(false)

export const feedPosts = ref<Post[]>([...posts])
