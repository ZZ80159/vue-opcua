<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h2>OPC UA 监控系统</h2>
        <p>请登录以继续</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="left" label-width="80px"
        class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user" autocomplete="username"
            @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock"
            show-password autocomplete="current-password" @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin" native-type="submit">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 错误提示 -->
      <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon closable :close-text="'关闭'"
        @close="errorMessage = ''" class="error-alert" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

// 定义表单类型
interface LoginForm {
  username: string
  password: string
  rememberMe: boolean
}

// 表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  rememberMe: false,
})

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 错误信息
const errorMessage = ref('')

// 路由和用户存储
const router = useRouter()
const userStore = useUserStore()

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码长度不能少于 4 个字符', trigger: 'blur' },
  ],
}

// 登录处理函数
const handleLogin = async () => {
  // 重置错误信息
  errorMessage.value = ''

  // 表单验证
  try {
    await loginFormRef.value.validate()

    // 设置加载状态
    loading.value = true

    // 模拟登录请求延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 简单的登录逻辑（实际项目中应该调用API）
    if (loginForm.username && loginForm.password) {
      // 生成模拟token
      const mockToken = `token_${Date.now()}_${loginForm.username}`

      // 保存用户信息到store
      userStore.login(loginForm.username, mockToken)

      // 记住密码逻辑
      if (loginForm.rememberMe) {
        localStorage.setItem('remembered_username', loginForm.username)
      } else {
        localStorage.removeItem('remembered_username')
      }

      // 显示成功消息
      ElMessage.success('登录成功')

      // 跳转到配置页面
      router.push('/home')
    } else {
      throw new Error('用户名和密码不能为空')
    }
  } catch (error) {
    // 处理验证错误或登录失败
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '登录失败，请稍后重试'
    }
  } finally {
    // 取消加载状态
    loading.value = false
  }
}

// 页面加载时检查是否有记住的用户名
const initForm = () => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.rememberMe = true
  }
}

// 组件挂载时初始化
onMounted(() => {
  initForm()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 32px;
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
}

.error-alert {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form-wrapper {
    padding: 24px;
    margin: 10px;
  }

  .login-header h2 {
    font-size: 20px;
  }
}

/* 动画效果 */
.login-form-wrapper {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
