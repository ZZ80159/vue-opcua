<template>
  <el-config-provider :locale="zhCn">
    <!-- 根容器 -->
    <div id="app" class="app-container">
      <!-- 路由过渡动画 -->
      <transition name="page-fade" mode="out-in">
        <template v-if="isLoggedIn">
          <!-- 已登录：主布局（导航栏 + 内容区 + 页脚） -->
          <el-container class="main-layout" style="height: 100vh">
            <!-- 顶部导航栏（Element Plus 导航组件） -->
            <el-header class="app-header" height="60px">
              <el-row :gutter="20" align="middle">
                <el-col :span="8">
                  <el-page-header content="Vue OPC UA 监控系统" />
                </el-col>
                <el-col :span="16" class="text-right">
                  <el-dropdown>
                    <span class="user-info">
                      <el-avatar icon="User" class="mr-2" />
                      {{ username }}
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleLogout" icon="Logout">
                          退出登录
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-col>
              </el-row>
            </el-header>

            <!-- 内容区（滚动容器） -->
            <el-main class="app-main">
              <router-view />
            </el-main>

            <!-- 页脚 -->
            <el-footer class="app-footer" height="40px">
              <p class="text-center text-gray-500 text-sm">
                © 2025 Vue OPC UA 监控系统 | 技术支持：Node-OPCUA + Vue 3 + Element Plus
              </p>
            </el-footer>
          </el-container>
        </template>
        <template v-else>
          <!-- 未登录：仅渲染登录页 -->
          <router-view />
        </template>
      </transition>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 登录状态和用户名（从 Pinia 读取）
const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.username)

/**
 * 退出登录（联动 OPC UA 断开连接）
 */
const handleLogout = async () => {
  // 1. 显示确认弹窗
  const { ElMessageBox } = await import('element-plus')
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // 2. 清除用户状态
      userStore.logout()
      // 3. 断开 OPC UA 连接
      const { useOpcuaStore } = await import('@/stores/opcuaStore')
      const opcuaStore = useOpcuaStore()
      if (opcuaStore.isConnected) {
        const { disconnectOpcuaServer } = await import('@/api/opcua-client')
        await disconnectOpcuaServer()
      }
      // 4. 跳转到登录页
      router.push('/login')
      // 5. 提示成功
      const { ElMessage } = await import('element-plus')
      ElMessage.success('退出登录成功！')
    })
    .catch(() => {
      // 取消退出，不做操作
    })
}
</script>

<style scoped>
/* 根容器 */
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 主布局 */
.main-layout {
  background-color: #fff;
}

/* 导航栏 */
.app-header {
  background-color: #1989fa;
  color: #fff;
  padding: 0 2rem;
}

.user-info {
  cursor: pointer;
  color: #fff;
  display: inline-flex;
  align-items: center;
}

/* 内容区 */
.app-main {
  padding: 1.5rem;
  overflow-y: auto;
  background-color: #f5f7fa;
}

/* 页脚 */
.app-footer {
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
}

/* 路由过渡动画 */
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
</style>
