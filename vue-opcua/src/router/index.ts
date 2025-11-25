import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginView.vue' // 登录页
import HomeView from '@/views/HomeView.vue' // 首页

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login', // 重定向到登录页
    },
    {
      path: '/login',
      name: 'Login', // 路由名称（唯一）
      component: Login, // 对应组件
      meta: {
        requiresAuth: false, // 无需登录即可访问
        title: '登录 - OPC UA 监控系统', // 页面标题
      },
    },
    {
      path: '/home',
      name: 'HomeView', // 路由名称（唯一）
      component: HomeView, // 对应组件
      meta: {
        requiresAuth: true, // 需要登录才能访问
        title: '首页 - OPC UA 监控系统', // 页面标题
      },
    },
  ],
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || 'OPC UA 监控系统'

  // 检查是否需要登录
  const requiresAuth = to.meta.requiresAuth as boolean

  if (requiresAuth) {
    // 从本地存储获取token
    const token = localStorage.getItem('opcua_token')

    // 如果没有token，重定向到登录页
    if (!token) {
      return next('/login')
    }
  }

  // 继续导航
  next()
})

export default router
