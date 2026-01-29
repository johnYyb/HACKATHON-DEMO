## 控制机器人去指定地点

Url: http://s.padbot.cn:9080/cloud/openapinav/controlRobotMoveToTargetPoint.action

Method: post

Parameters: 
system 	system信息
serialNumber 	机器⼈序列号
mapId 	地图ID
targetPointId 	⽬标点ID

## 请求机器人语音合成

Url: http://s.padbot.cn:9080/cloud/openapirobot/speechSynthesis.action

Method: post

Parameters:
system 	system信息
serialNumber 	机器⼈序列号
synthesisContent 	语⾳合成内容
webUrl 	需要展示的⽹址（⾮必须）