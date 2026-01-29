# 安全策略 
 为保障APP与服务器间的通讯安全，本协议要求所有通过 HTTP 交互的请求必须携带请求源的签名信息，签名 值作为 sign 存储在 HTTP请求的 system 参数集合中，请求采⽤POST⽅式提交，所有参数添加到请求的body中使 ⽤Json格式封装，请求的Content-Type使⽤application/json类型，并使⽤UTF-8字符编码。 
 服务器⾸先会检查 HTTP 请求中携带的 time 时间戳信息，如果与服务器系统时间差异⼤于 5 分钟，则视为⽆ 效的请求包，返回错误码。在时间戳检查正常的情况下，按照统⼀的算法校验 sign 签名值。只有当签名值⼀致 时，才接收HTTP 请求。 
2.1 Http请求参数格式
参数 	值 	说明
system 	sign 	签名值，服务端⽤来做签名校验。签名算法⻅下⾯
    appkey 	appkey
    time 	UTC时间戳，⾃1970年1⽉1⽇起计算的时间，单位为秒
    language 	语⾔
param1 	value1 	业务参数1
param2 	value2 	业务参数2
param… 	value… 	业务参数...


2.2 签名算法 
step 1：算出“签名原始串”= param参数字串(将所有字段按升序排列后，依次连接所有字段名及对应值)+system参 数中的time+appkey再+apptoken，样式如下： 
<param1>:<val1>,<param2>:<val2>,...,<paramn>:<valn>,time:<val>,appkey:<val>,apptoken: <val> 
step 2：将“签名原始串”进⾏MD5，并转化为16进制的32位⼩写字符串，作为签名值sign。 
2.3 签名范例 
请求参数信息如下： 
{ 
"system": { 
"time": 1445307713, 
"appkey": "4252e5d70b5b4d268503a09e4ace321b", 
"language": "zh-CN", 
"sign": "cb8263bc2c3fa9a914c4a7278a2c7f7b" 
 }, 
"param1": 12345, 
"param2": "abcde" 
} 
step1：将业务参数 param1，param2，…按字⺟升序排序，组成⽆空格字符串，最后拼接 time、appkey、 apptoken。最后组成的签名原始串如下： 
param1:12345,param2:abcde,time:1445307713,appkey:4252e5d70b5b4d268503a09e4ace321b,apptoken:c2041359975d4c07b067315dcf79d677 
step2：签名值即对上述签名原始串算md5值，即： 
sign=md5("param1:12345,param2:abcde,time:1445307713,appkey:4252e5d70b5b4d268503a09e4ace 321b,apptoken:c2041359975d4c07b067315dcf79d677")
最终sign值为：cb8263bc2c3fa9a914c4a7278a2c7f7b 

# 监听机器⼈信息 
如果想监听机器⼈的信息，可以连接 MQTT 服务，通过订阅 MQTT 的topic，获取机器⼈的状态信息。在监听 MQTT 信息之前，需要先通过接⼝获取订阅权限。 
7.1 获取MQTT连接凭证 
7.1.1 请求地址 
http://s.padbot.cn:9080/cloud/openapirobot/applyRobotMqttInfo.action 
7.1.2 范例 
请求参数信息如下： 
{ 
 "system": { 
 "time": 1445307713, 
 "appkey": "xxxxx", 
 "language": "zh-CN", 
 "sign": "xxxxx" 
 } 
} 
返回信息： 
{ 
 "messageCode": 10000, 
 "data": { 
 "clientId": "GID_Robot_Open@@@4a662aeba2e3409c81xxxxxxxxx",  "receiveTopic": "robot-open/562124000", 
 "username": "Token|LTAI5tRs6q8xxxxxxx|post-cn-xxxxxxxx",  "token": "R|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGU1P28xxxxxxxxxx",  "expireTime": 1657186791449, 
"port":1883, 
"host":"https://xxxx" 
 } 
}
7.1.3 返回字段解释 
字段 	字段 	说明
data 	receiveTopic 	订阅的topic，⽤于接收机器⼈的数据，多个⽤英⽂逗号隔开
    clientId 	连接的 clinetId
    username 	连接所需的⽤户名
    token 	连接所需的 token
    expireTime 	token 有效期
    port 	连接mqtt服务的端⼝
    host 	连接mqtt服务的地址
    robotMqttInfoList 	机器⼈mqtt信息，⾥⾯的postTopic⽤于给机器⼈发送数据
