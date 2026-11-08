import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, restoreSession } from '../store/session'

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
      meta: { guestOnly: true },
    },
    {
      path: '/cadastro',
      name: 'register',
      component: () => import('../pages/AuthPage.vue'),
      meta: { guestOnly: true },
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
      path: '/usuarios/:id',
      name: 'user',
      component: () => import('../pages/UserPage.vue'),
    },
    {
      path: '/notificacoes',
      name: 'notifications',
      component: () => import('../pages/NotificationsPage.vue'),
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

router.beforeEach(async (to) => {
  await restoreSession()
  if (to.meta.guestOnly) return isAuthenticated.value ? { name: 'home' } : true
  if (!isAuthenticated.value) return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  return true
})

export default router
