// Robot configuration for use across the app

export interface RobotConfig {
  mapId: string;
  homePointId?: string;
  kitchenPointId?: string;
  diningAreaPointId?: string;
  waitingAreaPointId?: string;
  appkey: string;
  apptoken: string;
  BASE_URL: string;
  MOVE_URL: string;
  SPEECH_URL: string;
  MQTT_URL: string;
  serialNumber: string;
  clientId: string;
  username: string;
  token: string;
  mqtt_hostname: string;
  mqtt_port: number;
  mqtt_sub_topic: string;
  backend_url: string;
  pointA: string;
  pointB: string,
  pointC: string,
}

export const ROBOT_CONFIG: RobotConfig = {
  mapId: '05dcfb4937f23f2f4fdf66b9e89687c5',
  homePointId: '1',
  kitchenPointId: '2f91db2a7ef24be49b111da4f2ce7ac7',
  diningAreaPointId: '64d83ad00fd848c1b4192527e8a26ca0',
  waitingAreaPointId: '4',
  pointA: 'A',
  pointB: 'B',
  pointC: 'C',
  // Add more config keys as needed
  appkey: '',
  apptoken: '',
  BASE_URL: 'http://s.padbot.cn:9080/',
  MOVE_URL:
    '/cloud/openapinav/controlRobotMoveToTargetPoint.action',
  SPEECH_URL:
    '/cloud/openapirobot/speechSynthesis.action',
  MQTT_URL:
    '/cloud/openapirobot/applyRobotMqttInfo.action',
  serialNumber: 'PX6397',
  clientId: 'GID_Robot_Open@@@a825a2fbb88f470ca3e32ba9a49beffb',
  username: 'Token|LTAI5tRs6q8KJonwMXcvGABe|post-cn-i7m25yinr0c',
  token:
    'R|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGU1P28HAMaxYxn8aQbALNtml7QZKl9L9kPTa0WZpLnkfkoSNklzDfrQejZwDUSzsd4X4qaD3n2TrADZbyy8RH08HNIsA2iv1DoYbz7MJWZDYC3DlW7gLEr35K6sQYWM6qmNXkyJduQm4vgS3Asj/GrCjhKOSZxhr49sLa92z2q6Q8sFLJD9ZhOGElzeSozsSru8LRVkiv/buUr4cJXFoNycvRILssyLnFo+jvs/wM1Vix3vRV3RTR92eAPP5+wbnIAPuCXnW8DfiizoJQRD4wfMmjlVmd5bi/pcL2dZ4dfsrzQ7q+05T0zxCflWuGQ/QXW6Zs6hizc18z5ZhkhDHimRWJCjqqqTGBscU8mf3miA9pr71x608Hleq1rkjdnM0Lt|W|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGUbrBXN77FaXpn8aQbALNtml7QZKl9L9kPTa0WZpLnkfkoSNklzDfrQejZwDUSzsd4X4qaD3n2TrADZbyy8RH08HNIsA2iv1DoYbz7MJWZDYC3DlW7gLEr35K6sQYWM6qmNXkyJduQm4vgS3Asj/GrCjhKOSZxhr49sLa92z2q6Q8sFLJD9ZhOGElzeSozsSru8LRVkiv/buVz4xDJzgSCJtfL390UDKpcgiQfES++LgHOmbDgt2heSSBbgcB6OwseyoMqS6Htp9Cjhc34yw3pVXC9nWeHX7K80O6vtOU9M8Qn5VrhkP0F1umbOoYs3NfM+WYZIQx4pkViQo6qqkxgbHFPJn95ogPaa+9cetPB5Xqta5I3ZzNC7Q==',
  mqtt_hostname: 'post-cn-i7m25yinr0c.mqtt.aliyuncs.com',
  mqtt_port: 1883,
  mqtt_sub_topic: 'robot-topic/1919862081/sub',
  backend_url: 'http://10.110.120.82:3000',
};

export const GET_MQTT_MESSAGE_SCRIPT: string = `node src/app/shared/robot/robot-mqtt-api-server.js APPKEY=2e9ecb3d0c514eec920916fa1d0503a7 APPTOKEN=mo19OkoGQ539BFf0`;
