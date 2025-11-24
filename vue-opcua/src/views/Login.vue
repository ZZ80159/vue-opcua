<template>
  <el-config-provider :locale="zhCn">
    <!-- 全屏背景 + 居中登录卡片 -->
    <div class="login-container">
      <el-card class="login-card" shadow="hover">
        <div class="login-header text-center mb-6">
          <el-icon class="login-icon" size="48">
            <Lock />
          </el-icon>
          <h2 class="login-title text-2xl font-bold text-gray-800 mt-2">OPC UA 系统登录</h2>
        </div>

        <!-- 登录表单（Element Plus 表单组件，带校验） -->
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix="User"
              :disabled="isLoading"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix="Lock"
              :disabled="isLoading"
              show-password
            />
          </el-form-item>
          <el-form-item label-width="0">
            <el-checkbox v-model="loginForm.remember" :disabled="isLoading"> 记住密码 </el-checkbox>
          </el-form-item>
          <el-form-item label-width="0">
            <el-button
              type="primary"
              size="large"
              class="w-full"
              :loading="isLoading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElConfigProvider, ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<any>(null) // 表单引用

// 登录表单数据
const loginForm = reactive({
  username: localStorage.getItem('opcua_username') || 'admin', // 记住用户名
  password: '123456', // 测试默认密码
  remember: localStorage.getItem('opcua_username') ? true : false, // 记住密码状态
})

// 表单校验规则
const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

// 加载状态
const isLoading = ref(false)

/**
 * 登录处理
 */
const handleLogin = async () => {
  // 1. 表单校验
  await loginFormRef.value.validate()
  isLoading.value = true

  try {
    // 2. 模拟后端登录接口（实际项目替换为真实接口）
    const res = await new Promise((resolve) => {
      setTimeout(() => {
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          resolve({ code: 200, token: 'opcua_token_123456', message: '登录成功' })
        } else {
          resolve({ code: 401, message: '用户名或密码错误' })
        }
      }, 1000)
    })

    // @ts-ignore 简化类型
    if (res.code === 200) {
      // 3. 保存用户状态到 Pinia
      userStore.login(loginForm.username, res.token)
      // 4. 记住用户名（如果勾选）
      if (loginForm.remember) {
        localStorage.setItem('opcua_username', loginForm.username)
      } else {
        localStorage.removeItem('opcua_username')
      }
      // 5. 跳转到 OPC UA 配置页
      router.push('/config')
      // 6. 提示成功
      ElMessage.success(res.message)
    } else {
      // 登录失败提示
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 登录容器：全屏居中 */
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1989fa 0%, #409eff 100%);
}

/* 登录卡片 */
.login-card {
  width: 400px;
  padding: 2rem;
  border-radius: 12px;
}

/* 登录头部图标 */
.login-icon {
  color: #1989fa;
}

/* 登录标题 */
.login-title {
  color: #1989fa;
}
</style>
