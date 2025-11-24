import { OPCUAClient, MessageSecurityMode, SecurityPolicy, ClientSubscription, MonitoredItem } from 'node-opcua';
import { useOpcuaStore } from '@/stores/opcuaStore';

let opcuaClient: OPCUAClient | null = null;
let subscription: ClientSubscription | null = null; // 订阅实例

/**
 * 连接 OPC UA 服务器
 */
export async function connectOpcuaServer() {
  const opcuaStore = useOpcuaStore();
  const { serverUrl, username, password } = opcuaStore;

  opcuaStore.setConnecting(true);
  opcuaStore.setErrorMsg('');

  try {
    // 1. 创建 OPC UA 客户端实例
    opcuaClient = OPCUAClient.create({
      applicationName: 'Vue OPC UA Client',
      securityMode: MessageSecurityMode.None, // 开发环境禁用安全模式（简单测试）
      securityPolicy: SecurityPolicy.None,
      endpointMustExist: false, // 允许连接未预配置的端点
    });

    // 2. 监听连接断开事件，自动重置状态
    opcuaClient.on('disconnection', () => {
      console.log('OPC UA 服务器断开连接');
      opcuaStore.setConnected(false);
      opcuaStore.clearSubscribedVariables();
      if (subscription) subscription.terminate();
      subscription = null;
    });

    // 3. 连接服务器
    await opcuaClient.connect(serverUrl);
    console.log(`OPC UA 连接成功：${serverUrl}`);

    // 4. 创建会话（带身份验证）
    const session = await opcuaClient.createSession({
      userName: username,
      password: password,
    });

    // 5. 存储会话到 Pinia
    opcuaStore.setSession(session);
    opcuaStore.setConnected(true);

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知连接错误';
    console.error('OPC UA 连接失败：', errMsg);
    opcuaStore.setErrorMsg(errMsg);
    opcuaStore.setConnected(false);
    throw error; // 抛出错误，让页面处理（如显示提示）
  } finally {
    opcuaStore.setConnecting(false);
  }
}

/**
 * 断开 OPC UA 连接
 */
export async function disconnectOpcuaServer() {
  const opcuaStore = useOpcuaStore();
  if (!opcuaClient || !opcuaStore.isConnected) return;

  try {
    if (subscription) {
      await subscription.terminate(); // 终止订阅
      subscription = null;
    }
    await opcuaClient.disconnect(); // 断开连接
    console.log('OPC UA 断开连接成功');
  } catch (error) {
    console.error('OPC UA 断开连接失败：', error);
  } finally {
    opcuaStore.setConnected(false);
    opcuaStore.clearSubscribedVariables();
  }
}

/**
 * 读取 OPC UA 变量
 * @param nodeId 变量节点ID（如 ns=2;s=Temperature）
 */
export async function readOpcuaVariable(nodeId: string) {
  const opcuaStore = useOpcuaStore();
  if (!opcuaStore.session) throw new Error('未建立 OPC UA 会话');

  try {
    const dataValue = await opcuaStore.session.readVariableValue(nodeId);
    if (dataValue.statusCode.isGood()) {
      return dataValue.value.value; // 返回变量值
    } else {
      throw new Error(`读取失败：${dataValue.statusCode.toString()}`);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知读取错误';
    console.error(`读取节点 ${nodeId} 失败：`, errMsg);
    opcuaStore.setErrorMsg(errMsg);
    throw error;
  }
}

/**
 * 写入 OPC UA 变量
 * @param nodeId 变量节点ID
 * @param value 要写入的值（需匹配变量类型，如数字、字符串）
 */
export async function writeOpcuaVariable(nodeId: string, value: any) {
  const opcuaStore = useOpcuaStore();
  if (!opcuaStore.session) throw new Error('未建立 OPC UA 会话');

  try {
    // 先读取变量类型，确保写入值类型匹配（简化版，实际可优化）
    const readResult = await opcuaStore.session.readVariableValue(nodeId);
    if (!readResult.statusCode.isGood()) throw new Error(`获取变量信息失败：${readResult.statusCode}`);

    // 构造写入请求（复用原变量类型）
    const writeRequest = {
      nodeId,
      attributeId: 13, // 13 = Value 属性
      value: {
        value: {
          typeId: readResult.value.typeId, // 保持类型一致
          value,
        },
      },
    };

    const writeResult = await opcuaStore.session.write(writeRequest);
    if (writeResult.statusCode.isGood()) {
      console.log(`写入节点 ${nodeId} 成功：${value}`);
      return true;
    } else {
      throw new Error(`写入失败：${writeResult.statusCode.toString()}`);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知写入错误';
    console.error(`写入节点 ${nodeId} 失败：`, errMsg);
    opcuaStore.setErrorMsg(errMsg);
    throw error;
  }
}

/**
 * 订阅 OPC UA 变量（变量变化时自动触发回调）
 * @param nodeId 变量节点ID
 * @param interval 订阅间隔（毫秒，默认1000ms）
 */
export async function subscribeOpcuaVariable(nodeId: string, interval = 1000) {
  const opcuaStore = useOpcuaStore();
  if (!opcuaStore.session) throw new Error('未建立 OPC UA 会话');

  try {
    // 1. 若未创建订阅实例，先创建
    if (!subscription) {
      subscription = ClientSubscription.create(opcuaStore.session, {
        requestedPublishingInterval: interval, // 发布间隔
        requestedLifetimeCount: 100,
        requestedMaxKeepAliveCount: 10,
        maxNotificationsPerPublish: 100,
        publishingEnabled: true,
        priority: 10,
      });

      // 监听订阅断开
      subscription.on('terminated', () => {
        console.log('OPC UA 订阅终止');
        subscription = null;
      });
    }

    // 2. 创建监控项（监听变量）
    const monitoredItem = MonitoredItem.create(subscription, {
      nodeId,
      attributeId: 13, // Value 属性
    }, {
      samplingInterval: interval, // 采样间隔
      queueSize: 1,
      discardOldest: true,
    });

    // 3. 变量变化时更新 Pinia 状态
    monitoredItem.on('changed', (dataValue) => {
      if (dataValue.statusCode.isGood()) {
        const value = dataValue.value.value;
        console.log(`节点 ${nodeId} 变化：${value}`);
        opcuaStore.updateSubscribedVariable(nodeId, value); // 同步到全局状态
      }
    });

    console.log(`订阅节点 ${nodeId} 成功（间隔：${interval}ms）`);
    return monitoredItem;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知订阅错误';
    console.error(`订阅节点 ${nodeId} 失败：`, errMsg);
    opcuaStore.setErrorMsg(errMsg);
    throw error;
  }
}