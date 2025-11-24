import { defineStore } from 'pinia';

// 定义用户状态类型
interface UserState {
  isLoggedIn: boolean; // 是否登录
  username: string; // 登录用户名
  token: string | null; // 登录令牌（可选，用于后端验证）
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    username: '',
    token: localStorage.getItem('opcua_token') || null, // 从本地存储读取令牌（持久化）
  }),
  actions: {
    // 登录：保存用户信息
    login(username: string, token: string) {
      this.isLoggedIn = true;
      this.username = username;
      this.token = token;
      localStorage.setItem('opcua_token', token); // 令牌持久化（刷新不丢失）
    },
    // 退出登录：清除用户信息
    logout() {
      this.isLoggedIn = false;
      this.username = '';
      this.token = null;
      localStorage.removeItem('opcua_token'); // 清除本地存储
    },
  },
});