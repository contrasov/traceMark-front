import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/entrar',
      name: 'login',
      component: () => import('../pages/AuthPage.vue'),
    },
    {
      path: '/post/:id',
      name: 'post',
      component: () => import('../pages/PostPage.vue'),
    },
    {
      path: '/perfil',
      name: 'profile',
      component: () => import('../pages/ProfilePage.vue'),
    },
    {
      path: '/configuracoes',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
