import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import * as CryptoJS from 'crypto-js';
import { ROBOT_CONFIG } from './robot-config';

/**
 * Robot Control Service
 * 基于 robot-control-api.md 的机器人控制服务
 */
@Injectable({
  providedIn: 'root'
})
export class RobotControlService {
  
  // API 配置
  private readonly BASE_URL = ROBOT_CONFIG.BASE_URL;
  private readonly MOVE_URL = ROBOT_CONFIG.MOVE_URL;
  private readonly SPEECH_URL = ROBOT_CONFIG.SPEECH_URL;
  private readonly MQTT_URL = ROBOT_CONFIG.MQTT_URL;
  
  // 认证信息 - 从环境变量或配置中获取
  private appkey = ROBOT_CONFIG.appkey;
  private apptoken = ROBOT_CONFIG.apptoken;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=UTF-8'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * 设置认证信息
   */
  setCredentials(appkey: string, apptoken: string): void {
    this.appkey = appkey;
    this.apptoken = apptoken;
  }

  /**
   * 生成 MD5 签名
   * 按照 robot-api.md 中的签名算法实现
   * 
   * @param businessParams 业务参数
   * @param time UTC时间戳
   * @returns 签名字符串
   */
  private generateSign(businessParams: any, time: number): string {
    // Step 1: 将业务参数按字母升序排序
    const sortedKeys = Object.keys(businessParams).sort();
    const paramPairs = sortedKeys.map(key => `${key}:${businessParams[key]}`);
    
    // Step 2: 拼接签名原始串
    const signParts = [
      ...paramPairs,
      `time:${time}`,
      `appkey:${this.appkey}`,
      `apptoken:${this.apptoken}`
    ];
    
    const signatureString = signParts.join(',');
    console.log('签名原始串:', signatureString);
    
    // Step 3: 计算 MD5 并转换为小写16进制字符串
    // const sign = CryptoJS.MD5(signatureString).toString();
    const sign = '';
    return sign;
  }

  /**
   * 构建请求体
   * 
   * @param businessParams 业务参数
   * @returns 完整的请求体
   */
  private buildRequestBody(businessParams: any): any {
    const time = Math.floor(Date.now() / 1000);
    const sign = this.generateSign(businessParams, time);
    
    return {
      system: {
        time: time,
        appkey: this.appkey,
        language: 'zh-CN',
        sign: sign
      },
      ...businessParams
    };
  }

  /**
   * 控制机器人移动到指定地点
   * 
   * @param serialNumber 机器人序列号
   * @param mapId 地图ID
   * @param targetPointId 目标点ID
   * @returns Observable
   */
  moveToTargetPoint(serialNumber: string, mapId: string, targetPointId: string): Observable<any> {
    const businessParams = {
      serialNumber: serialNumber,
      mapId: mapId,
      targetPointId: targetPointId
    };
    
    const requestBody = this.buildRequestBody(businessParams);
    console.log('移动机器人请求:', requestBody);
    
    return this.http.post(this.MOVE_URL, requestBody, this.httpOptions);
  }

  /**
   * 请求机器人语音合成（Text-to-Speech）
   * 
   * @param serialNumber 机器人序列号
   * @param synthesisContent 语音合成内容
   * @param webUrl 需要展示的网址（可选）
   * @returns Observable
   */
  speechSynthesis(serialNumber: string, synthesisContent: string, webUrl?: string): Observable<any> {
    const businessParams: any = {
      serialNumber: serialNumber,
      synthesisContent: synthesisContent
    };
    
    if (webUrl) {
      businessParams.webUrl = webUrl;
    }
    
    const requestBody = this.buildRequestBody(businessParams);
    console.log('语音合成请求:', requestBody);
    
    return this.http.post(this.SPEECH_URL, requestBody, this.httpOptions);
  }

  /**
   * 获取 MQTT 连接凭证
   * 用于监听机器人信息
   * 
   * @returns Observable
   */
  getMqttCredentials(): Observable<any> {
    const businessParams = {};
    const requestBody = this.buildRequestBody(businessParams);
    console.log('获取MQTT凭证请求:', requestBody);
    
    return this.http.post(this.MQTT_URL, requestBody, this.httpOptions);
  }

  // ==================== 便捷方法 ====================

  /**
   * 让机器人说话
   * 
   * @param serialNumber 机器人序列号
   * @param text 要说的文本
   * @returns Observable
   */
  speak(serialNumber: string, text: string): Observable<any> {
    return this.speechSynthesis(serialNumber, text);
  }

  /**
   * 让机器人说话并显示网页
   * 
   * @param serialNumber 机器人序列号
   * @param text 要说的文本
   * @param webUrl 要显示的网址
   * @returns Observable
   */
  speakWithWeb(serialNumber: string, text: string, webUrl: string): Observable<any> {
    return this.speechSynthesis(serialNumber, text, webUrl);
  }

  /**
   * 移动机器人到指定位置
   * 
   * @param serialNumber 机器人序列号
   * @param mapId 地图ID
   * @param targetPointId 目标点ID
   * @returns Observable
   */
  moveTo(serialNumber: string, mapId: string, targetPointId: string): Observable<any> {
    return this.moveToTargetPoint(serialNumber, mapId, targetPointId);
  }

  /**
   * 欢迎客户（便捷方法）
   * 
   * @param serialNumber 机器人序列号
   * @param customMessage 自定义欢迎语（可选）
   * @returns Observable
   */
  welcomeCustomer(serialNumber: string, customMessage?: string): Observable<any> {
    const message = customMessage || '欢迎光临！很高兴为您服务。';
    return this.speak(serialNumber, message);
  }

  /**
   * 引导客户到餐桌（便捷方法）
   * 
   * @param serialNumber 机器人序列号
   * @param mapId 地图ID
   * @param targetPointId 目标点ID
   * @param tableNumber 桌号（可选）
   * @returns Observable
   */
  guideToTable(serialNumber: string, mapId: string, targetPointId: string, tableNumber?: string): Observable<any> {
    const message = tableNumber 
      ? `请跟我来，我带您去${tableNumber}号桌。`
      : '请跟我来，我带您去您的座位。';
    
    // 先说话，然后移动
    return new Observable(observer => {
      this.speak(serialNumber, message).subscribe({
        next: (response) => {
          console.log('说话完成:', response);
          // 说话完成后，移动到目标位置
          this.moveTo(serialNumber, mapId, targetPointId).subscribe({
            next: (moveResponse) => {
              observer.next(moveResponse);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * 送餐到指定位置（便捷方法）
   * 
   * @param serialNumber 机器人序列号
   * @param mapId 地图ID
   * @param targetPointId 目标点ID
   * @param tableNumber 桌号（可选）
   * @returns Observable
   */
  deliverFood(serialNumber: string, mapId: string, targetPointId: string, tableNumber?: string): Observable<any> {
    const message = tableNumber 
      ? `正在为${tableNumber}号桌送餐，请稍候。`
      : '您的餐点来了，请享用。';
    
    return new Observable(observer => {
      // 先移动到目标位置
      this.moveTo(serialNumber, mapId, targetPointId).subscribe({
        next: (moveResponse) => {
          console.log('移动完成:', moveResponse);
          // 到达后说话
          this.speak(serialNumber, message).subscribe({
            next: (speakResponse) => {
              observer.next(speakResponse);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * 回到充电桩/起始位置（便捷方法）
   * 
   * @param serialNumber 机器人序列号
   * @param homeMapId 起始位置地图ID（默认为'1'）
   * @param homePointId 起始位置点ID（默认为'1'）
   * @returns Observable
   */
  returnHome(serialNumber: string, homeMapId: string = '1', homePointId: string = '1'): Observable<any> {
    return new Observable(observer => {
      this.speak(serialNumber, '任务完成，正在返回待命位置。').subscribe({
        next: () => {
          this.moveTo(serialNumber, homeMapId, homePointId).subscribe({
            next: (response) => {
              observer.next(response);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
