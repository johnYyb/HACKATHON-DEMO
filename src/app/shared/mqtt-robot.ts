import mqtt from 'mqtt';

/**
 * 阿里云机器人MQTT监听器
 * 用于监听机器人状态信息并支持向机器人发送控制指令
 */
interface RobotMqttInfo {
    serialNumber: string;
    postTopic: string;
    pubTopic: string;
    subTopic?: string;
}

interface MqttConfig {
    host: string;
    port: number;
    clientId: string;
    username: string;
    token: string;
    expireTime: number;
    robotMqttInfoList: RobotMqttInfo[];
}

import { MqttClient, IClientOptions } from 'mqtt';

class AliyunRobotMQTTListener {
    host: string;
    port: number;
    clientId: string;
    username: string;
    token: string;
    expireTime: number;
    robotList: RobotMqttInfo[];
    mqttClient: MqttClient | null;
    isConnected: boolean;

    constructor(mqttConfig: MqttConfig) {
        this.host = mqttConfig.host;
        this.port = mqttConfig.port;
        this.clientId = mqttConfig.clientId;
        this.username = mqttConfig.username;
        this.token = mqttConfig.token;
        this.expireTime = mqttConfig.expireTime;
        this.robotList = mqttConfig.robotMqttInfoList || [];
        this.mqttClient = null;
        this.isConnected = false;
    }

    /**
     * 检查token是否过期
     */
    checkTokenExpiry(): boolean {
        const currentTime = Date.now();
        if (currentTime >= this.expireTime) {
            console.error('❌ Token已过期，请重新调用API获取订阅权限');
            const expireDate = new Date(this.expireTime);
            console.error(`   过期时间: ${expireDate.toLocaleString('zh-CN')}`);
            return false;
        }
        
        const expireDate = new Date(this.expireTime);
        const remainingTime = this.expireTime - currentTime;
        const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`✅ Token有效`);
        console.log(`   过期时间: ${expireDate.toLocaleString('zh-CN')}`);
        console.log(`   剩余时间: ${remainingHours}小时 ${remainingMinutes}分钟\n`);
        return true;
    }

    /**
     * 开始监听机器人消息
     */
    startListening(): void {
        // 检查token
        if (!this.checkTokenExpiry()) {
            return;
        }

        console.log('='.repeat(70));
        console.log('🚀 正在初始化阿里云MQTT客户端');
        console.log('='.repeat(70));
        console.log(`📡 服务器: ${this.host}:${this.port}`);
        console.log(`🆔 客户端ID: ${this.clientId}`);
        console.log(`👤 用户名: ${this.username}`);
        
        // 显示机器人信息
        console.log(`\n🤖 监听 ${this.robotList.length} 个机器人:\n`);
        this.robotList.forEach((robot, index) => {
            console.log(`   [${index + 1}] 机器人: ${robot.serialNumber}`);
            console.log(`       📥 接收数据 (pubTopic):  ${robot.pubTopic}`);
            console.log(`       📤 发送数据 (postTopic): ${robot.postTopic}\n`);
        });

        console.log('='.repeat(70) + '\n');

        // MQTT连接URL
        const mqttUrl = `mqtt://${this.host}:${this.port}`;
        
        // 连接选项

        const options: IClientOptions = {
            clientId: this.clientId,
            username: this.username,
            password: this.token,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 30000,
            keepalive: 60,
            protocolVersion: 4
        };

        // 创建MQTT客户端并连接
        console.log(`⏳ 正在连接到 ${mqttUrl} ...\n`);
        this.mqttClient = mqtt.connect(mqttUrl, options);

        // 注册事件处理器
        this.setupEventHandlers();
    }

    /**
     * 设置MQTT事件处理器
     */
    setupEventHandlers(): void {
        // 连接成功事件
        if (!this.mqttClient) return;
        this.mqttClient.on('connect', () => {
            this.isConnected = true;
            console.log('='.repeat(70));
            console.log('✅ 成功连接到阿里云MQTT服务器');
            console.log('='.repeat(70));

            // 订阅所有机器人的pubTopic（接收机器人发布的数据）
                this.robotList.forEach((robot: RobotMqttInfo) => {
                    const topic = robot.pubTopic;
                    this.mqttClient!.subscribe(topic, { qos: 1 }, (err: Error | null) => {
                        if (!err) {
                            console.log(`✅ 已订阅 [${robot.serialNumber}]: ${topic}`);
                        } else {
                            console.error(`❌ 订阅失败 [${robot.serialNumber}]: ${err.message}`);
                        }
                    });
                });

            console.log('='.repeat(70));
            console.log('👂 开始监听机器人消息...');
            console.log('='.repeat(70) + '\n');
        });

        // 接收消息事件
        this.mqttClient.on('message', (topic: string, message: Buffer) => {
            this.handleMessage(topic, message);
        });

        // 连接错误事件
        this.mqttClient.on('error', (error: Error) => {
            console.error('\n❌ MQTT错误:', error.message);
            if (error.message.includes('Not authorized')) {
                console.error('💡 请检查username和token是否正确');
            } else if (error.message.includes('Connection refused')) {
                console.error('💡 请检查服务器地址和端口是否正确');
            }
        });

        // 断开连接事件
        this.mqttClient.on('close', () => {
            this.isConnected = false;
            console.log('\n⚠️  MQTT连接已关闭');
        });

        // 重连事件
        this.mqttClient.on('reconnect', () => {
            console.log('🔄 正在尝试重新连接...');
        });

        // 离线事件
        this.mqttClient.on('offline', () => {
            this.isConnected = false;
            console.log('📴 MQTT客户端离线');
        });
    }

    /**
     * 处理接收到的消息
     */
    handleMessage(topic: string, message: Buffer): void {
        try {
            const payload = message.toString('utf-8');
            const timestamp = new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            console.log('\n' + '━'.repeat(70));
            console.log(`⚡ 收到消息 - ${timestamp}`);
            console.log('━'.repeat(70));
            console.log(`📍 Topic: ${topic}`);

            // 识别是哪个机器人的消息
            const robotInfo = this.getRobotByTopic(topic);
            if (robotInfo) {
                console.log(`🤖 机器人: ${robotInfo.serialNumber}`);
            }

            // 尝试解析JSON
            try {
                const data = JSON.parse(payload);
                console.log('\n📊 数据内容:');
                console.log(JSON.stringify(data, null, 2));

                // 处理机器人数据
                if (robotInfo) {
                    this.handleRobotData(robotInfo, data);
                }
            } catch (jsonError) {
                console.log('\n📄 原始数据:');
                console.log(payload);
            }

            console.log('━'.repeat(70) + '\n');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('❌ 处理消息时发生错误:', error.message);
            } else {
                console.error('❌ 处理消息时发生错误:', error);
            }
        }
    }

    /**
     * 根据topic查找对应的机器人信息
     */
    getRobotByTopic(topic: string): RobotMqttInfo | undefined {
        return this.robotList.find((robot: RobotMqttInfo) => robot.pubTopic === topic);
    }

    /**
     * 处理机器人数据
     */
    handleRobotData(robotInfo: RobotMqttInfo, data: any): void {
        console.log('\n📈 数据解析:');

        // 状态信息
        if (data.status !== undefined) {
            console.log(`   📌 状态: ${data.status}`);
        }

        // 运行模式
        if (data.mode !== undefined) {
            console.log(`   ⚙️  模式: ${data.mode}`);
        }

        // 位置信息
        if (data.position || (data.x !== undefined && data.y !== undefined)) {
            const pos = data.position || data;
            console.log(`   📍 位置: X=${pos.x}, Y=${pos.y}, Z=${pos.z || 0}`);
            if (pos.angle !== undefined) {
                console.log(`   🧭 角度: ${pos.angle}°`);
            }
        }

        // 电池信息
        const battery = data.battery || data.batteryLevel || data.power;
        if (battery !== undefined) {
            console.log(`   🔋 电量: ${battery}%`);
            
            if (battery < 10) {
                console.log(`   🚨 严重警告: 电量极低 (${battery}%)，请立即充电！`);
            } else if (battery < 20) {
                console.log(`   ⚠️  警告: 电量过低 (${battery}%)，建议充电`);
            } else if (battery < 30) {
                console.log(`   💡 提示: 电量偏低，请关注`);
            }
        }

        // 速度信息
        const speed = data.speed || data.velocity;
        if (speed !== undefined) {
            console.log(`   💨 速度: ${speed} m/s`);
        }

        // 温度信息
        if (data.temperature !== undefined) {
            console.log(`   🌡️  温度: ${data.temperature}°C`);
            if (data.temperature > 70) {
                console.log(`   ⚠️  警告: 温度过高！`);
            }
        }

        // 告警信息
        const alert = data.alert || data.alarm || data.error || data.warning;
        if (alert) {
            console.log(`   🚨 告警: ${JSON.stringify(alert)}`);
        }

        // 任务信息
        const task = data.task || data.mission || data.job;
        if (task) {
            console.log(`   📋 任务: ${JSON.stringify(task)}`);
        }

        // 信号强度
        if (data.signal !== undefined || data.rssi !== undefined) {
            const signal = data.signal || data.rssi;
            console.log(`   📶 信号: ${signal}`);
        }

        // 其他字段
        const knownFields = ['status', 'mode', 'position', 'x', 'y', 'z', 'angle', 
                            'battery', 'batteryLevel', 'power', 'speed', 'velocity',
                            'temperature', 'alert', 'alarm', 'error', 'warning',
                            'task', 'mission', 'job', 'signal', 'rssi'];
        
        const otherFields = Object.keys(data).filter(key => !knownFields.includes(key));
        if (otherFields.length > 0) {
            console.log('\n   📎 其他字段:');
            otherFields.forEach(key => {
                const value = JSON.stringify(data[key]);
                console.log(`      • ${key}: ${value}`);
            });
        }
    }

    /**
     * 向指定机器人发送数据（使用postTopic）
     */
    sendToRobot(serialNumber: string, message: any): boolean {
        if (!this.isConnected) {
            console.error('❌ 无法发送: MQTT未连接');
            return false;
        }

        const robotInfo = this.robotList.find(r => r.serialNumber === serialNumber);
        
        if (!robotInfo) {
            console.error(`❌ 未找到机器人: ${serialNumber}`);
            console.log('可用的机器人:');
            this.robotList.forEach(r => console.log(`   • ${r.serialNumber}`));
            return false;
        }

        const postTopic = robotInfo.postTopic;
        const payload = typeof message === 'object' ? JSON.stringify(message) : message;

        console.log('\n' + '─'.repeat(70));
        console.log(`📤 发送数据到机器人: ${serialNumber}`);
        console.log(`📍 Topic: ${postTopic}`);
        console.log(`📦 内容: ${payload}`);

            if (this.mqttClient) {
                this.mqttClient.publish(postTopic, payload, { qos: 1 }, (err?: Error) => {
            if (!err) {
                console.log('✅ 发送成功');
            } else {
                console.error(`❌ 发送失败: ${err.message}`);
            }
            console.log('─'.repeat(70) + '\n');
        });
            }

        return true;
    }

    /**
     * 获取连接状态
     */
    getStatus() {
        return {
            connected: this.isConnected,
            robotCount: this.robotList.length,
            robots: this.robotList.map(r => ({
                serialNumber: r.serialNumber,
                pubTopic: r.pubTopic,
                postTopic: r.postTopic
            }))
        };
    }

    /**
     * 停止监听
     */
    stop() {
        if (this.mqttClient) {
            console.log('\n' + '='.repeat(70));
            console.log('🛑 正在停止MQTT监听...');
            
            this.mqttClient.end(false, () => {
                console.log('✅ 已断开连接');
                console.log('='.repeat(70) + '\n');
            });
            
            this.isConnected = false;
        }
    }
}

// ============================================================================
// 使用示例
// ============================================================================

// 从API获取的实际配置数据
const mqttConfig = {
  host: "post-cn-i7m25yinr0c.mqtt.aliyuncs.com",
  port: 1883,
  clientId: "GID_Robot_Open@@@a825a2fbb88f470ca3e32ba9a49beffb",
  username: "Token|LTAI5tRs6q8KJonwMXcvGABe|post-cn-i7m25yinr0c",
  token:
    "R|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGU1P28HAMaxYxn8aQbALNtml7QZKl9L9kPTa0WZpLnkfkoSNklzDfrQejZwDUSzsd4X4qaD3n2TrADZbyy8RH08HNIsA2iv1DoYbz7MJWZDYC3DlW7gLEr35K6sQYWM6qmNXkyJduQm4vgS3Asj/GrCjhKOSZxhr49sLa92z2q6Q8sFLJD9ZhOGElzeSozsSru8LRVkiv/buUr4cJXFoNycvRILssyLnFo+jvs/wM1Vix3vRV3RTR92eAPP5+wbnIAPuCXnW8DfiizoJQRD4wfMmjlVmd5bi/pcL2dZ4dfsrzQ7q+05T0zxCflWuGQ/QXW6Zs6hizc18z5ZhkhDHimRWJCjqqqTGBscU8mf3miA9pr71x608Hleq1rkjdnM0Lt|W|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGUbrBXN77FaXpn8aQbALNtml7QZKl9L9kPTa0WZpLnkfkoSNklzDfrQejZwDUSzsd4X4qaD3n2TrADZbyy8RH08HNIsA2iv1DoYbz7MJWZDYC3DlW7gLEr35K6sQYWM6qmNXkyJduQm4vgS3Asj/GrCjhKOSZxhr49sLa92z2q6Q8sFLJD9ZhOGElzeSozsSru8LRVkiv/buVz4xDJzgSCJtfL390UDKpcgiQfES++LgHOmbDgt2heSSBbgcB6OwseyoMqS6Htp9Cjhc34yw3pVXC9nWeHX7K80O6vtOU9M8Qn5VrhkP0F1umbOoYs3NfM+WYZIQx4pkViQo6qqkxgbHFPJn95ogPaa+9cetPB5Xqta5I3ZzNC7Q==",
  expireTime: 1769996284000,
  robotMqttInfoList: [
    {
      serialNumber: "PX6397",
      postTopic: "robot-topic/1919862081/sub",
      pubTopic: "robot-open/1919862081/pub/data",
      subTopic: "robot-topic/1919862081/sub",
    }
  ],
};

// 创建监听器
const listener = new AliyunRobotMQTTListener(mqttConfig);

// 开始监听
// listener.startListening();

// 示例：5秒后发送控制指令给PX6397
// setTimeout(() => {
//     console.log('\n📨 发送测试指令...\n');
//     listener.sendToRobot('PX6397', {
//         command: 'move',
//         direction: 'forward',
//         speed: 1.5,
//         timestamp: Date.now()
//     });
// }, 5000);



// 示例：15秒后获取连接状态
// setTimeout(() => {
//     const status = listener.getStatus();
//     console.log('\n📊 当前状态:');
//     console.log(JSON.stringify(status, null, 2));
//     console.log('');
// }, 15000);

// // Ctrl+C 优雅退出
// process.on('SIGINT', () => {
//     console.log('\n\n⏹️  收到中断信号 (Ctrl+C)');
//     listener.stop();
//     setTimeout(() => process.exit(0), 1000);
// });

// // SIGTERM 退出
// process.on('SIGTERM', () => {
//     console.log('\n⏹️  收到终止信号');
//     listener.stop();
//     setTimeout(() => process.exit(0), 1000);
// });

// // 未捕获异常
// process.on('uncaughtException', (error) => {
//     console.error('\n❌ 未捕获异常:', error.message);
//     console.error(error.stack);
//     listener.stop();
//     process.exit(1);
// });

// // Promise 拒绝
// process.on('unhandledRejection', (reason, promise) => {
//     console.error('\n❌ 未处理的Promise拒绝:');
//     console.error(reason);
// });

// 导出类供其他模块使用
export { AliyunRobotMQTTListener, listener };