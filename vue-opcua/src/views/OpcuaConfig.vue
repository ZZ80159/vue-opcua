<template>
  <el-config-provider :locale="zhCn">
    <el-card shadow="hover" class="config-card">
      <el-page-header content="OPC UA 服务器连接配置" />

      <!-- 连接配置表单 -->
      <el-form
        :model="configForm"
        :rules="configRules"
        ref="configFormRef"
        label-width="120px"
        class="mt-4"
      >
        <el-form-item label="服务器地址" prop="serverUrl">
          <el-input
            v-model="configForm.serverUrl"
            placeholder="opc.tcp://localhost:4840"
            prefix="Link"
            :disabled="isConnecting || isConnected"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="configForm.username"
            placeholder="可选"
            prefix="User"
            :disabled="isConnecting || isConnected"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="configForm.password"
            type="password"
            placeholder="可选"
            prefix="Lock"
            :disabled="isConnecting || isConnected"
            show-password
          />
        </el-form-item>

        <!-- 操作按钮组 -->
        <el-form-item label-width="0">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-button
                type="primary"
                :loading="isConnecting"
                :disabled="isConnected"
                @click="handleConnect"
                icon="Connection"
              >
                连接服务器
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button
                type="danger"
                :disabled="!isConnected || isConnecting"
                @click="handleDisconnect"
                icon="Disconnect"
              >
                断开连接
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-link type="primary" :disabled="!isConnected" @click="goToMonitor">
                <el-button type="success" icon="Monitor">进入数据监控</el-button>
              </el-link>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>

      <!-- 连接状态信息 -->
      <el-divider content="连接状态" />
      <el-descriptions title="当前状态" border :column="1" class="mt-2">
        <el-descriptions-item label="连接状态">
          <el-tag :type="isConnected ? 'success' : 'danger'">
            {{ isConnected ? '已连接' : '未连接' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="服务器地址">
          {{ configForm.serverUrl || '未配置' }}
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" v-if="errorMsg">
          <el-tag type="danger" class="block w-full text-left">
            {{ errorMsg }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElConfigProvider, ElMessage } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { Connection, Disconnect, Link, Lock, Monitor, User } from '@element-plus/icons-vue'
import { useOpcuaStore } from '@/stores/opcuaStore'
import { connectOpcuaServer, disconnectOpcuaServer } from '@/api/opcua-client'

const router = useRouter()
const opcuaStore = useOpcuaStore()
const configFormRef = ref<any>(null)

// 配置表单数据（默认读取 Pinia 中的值）
const configForm = reactive({
  serverUrl: opcuaStore.serverUrl,
  username: opcuaStore.username,
  password: opcuaStore.password,
})

// 表单校验规则
const configRules = reactive({
  serverUrl: [{ required: true, message: '请输入服务器地址', trigger: 'blur' }],
})

// 状态数据（从 Pinia 读取）
const isConnected = computed(() => opcuaStore.isConnected)
const isConnecting = computed(() => opcuaStore.isConnecting)
const errorMsg = computed(() => opcuaStore.errorMsg)

/**
 * 连接服务器
 */
const handleConnect = async () => {
  // 1. 表单校验
  await configFormRef.value.validate()
  try {
    // 2. 更新 Pinia 中的配置
    opcuaStore.serverUrl = configForm.serverUrl
    opcuaStore.username = configForm.username
    opcuaStore.password = configForm.password
    // 3. 连接 OPC UA 服务器
    await connectOpcuaServer()
    ElMessage.success('OPC UA 服务器连接成功！')
  } catch (error) {
    // 错误已在工具类中处理，此处仅提示
  }
}

/**
 * 断开连接
 */
const handleDisconnect = async () => {
  try {
    await disconnectOpcuaServer()
    ElMessage.success('OPC UA 服务器断开连接成功！')
  } catch (error) {
    ElMessage.error('断开连接失败，请重试')
  }
}

/**
 * 跳转到数据监控页
 */
const goToMonitor = () => {
  router.push('/monitor')
}
</script>

<style scoped>
/* 配置卡片 */
.config-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>
