import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '@/views/Login.vue'; // 登录页
import OpcuaConfig from '@/views/OpcuaConfig.vue'; // OPC UA 连接配置页

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login', // 登录页路径
      name: 'Login', // 路由名称（唯一）
      component: Login, // 对应组件
      meta: {
        requiresAuth: false, // 无需登录即可访问
        title: '登录 - OPC UA 监控系统' // 页面标题
      }
    },
    {
      path: '/config', // OPC UA 配置页路径
      name: 'OpcuaConfig',
      component: OpcuaConfig,
      meta: {
        requiresAuth: true, // 需要登录才能访问
        title: '连接配置 - OPC UA 监控系统'
      }
    },
  ],
})

export default router
