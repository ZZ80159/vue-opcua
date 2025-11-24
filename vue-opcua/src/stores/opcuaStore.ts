import { defineStore } from 'pinia';
import { ClientSession } from 'node-opcua';

// 定义 OPC UA 状态类型
interface OpcuaState {
  serverUrl: string; // 服务器地址（如 opc.tcp://localhost:4840）
  username: string; // 用户名（可选）
  password: string; // 密码（可选）
  isConnected: boolean; // 是否连接成功
  isConnecting: boolean; // 是否正在连接中
  session: ClientSession | null; // OPC UA 会话实例（核心）
  subscribedVariables: Record<string, any>; // 订阅的变量（key: 节点ID，value: 变量值）
  errorMsg: string; // 错误信息
}

export const useOpcuaStore = defineStore('opcua', {
  state: (): OpcuaState => ({
    serverUrl: 'opc.tcp://localhost:4840', // 默认地址
    username: '',
    password: '',
    isConnected: false,
    isConnecting: false,
    session: null,
    subscribedVariables: {},
    errorMsg: '',
  }),
  actions: {
    // 设置连接中状态
    setConnecting(connecting: boolean) {
      this.isConnecting = connecting;
    },
    // 设置连接状态
    setConnected(connected: boolean) {
      this.isConnected = connected;
      if (!connected) this.session = null; // 断开连接时清空会话
    },
    // 设置会话实例
    setSession(session: ClientSession | null) {
      this.session = session;
    },
    // 设置错误信息
    setErrorMsg(msg: string) {
      this.errorMsg = msg;
    },
    // 更新订阅的变量值
    updateSubscribedVariable(nodeId: string, value: any) {
      this.subscribedVariables[nodeId] = value;
    },
    // 清空订阅数据
    clearSubscribedVariables() {
      this.subscribedVariables = {};
    },
  },
});