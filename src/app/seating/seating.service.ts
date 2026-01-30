import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SeatingService {
  private endpoint = 'http://s.padbot.cn:9080/cloud/openapinav/controlRobotMoveToTargetPoint.action';
  private appkey = `2e9ecb3d0c514eec920916fa1d0503a7`;
  private apptoken = `mo19OkoGQ539BFf0`;
  private serialNumber = `PX6397`;
  private language = 'zh-CN';

  getUTCTimestamp(date: any) {
    return Math.floor(new Date(date).getTime() / 1000);
 }

  constructor() { }

  /**
   * Send a POST request to the robot control endpoint using axios.
   * The endpoint expects a form URL encoded body with key `targetPointId`.
   * Returns a Promise that resolves with the axios response.
   */
  async moveToTarget(targetPointId: string): Promise<AxiosResponse<any>> {
    const mapId = 'MAP_HACKATHON_2024';
    const UTC = this.getUTCTimestamp(new Date());
    const sign = `mapId:${mapId},serialNumber:${this.serialNumber},targetPointId:${targetPointId},time:${UTC},appkey:${this.appkey},apptoken:${this.apptoken}`;
    const md5Sign = CryptoJS.MD5(sign).toString();

    const body = {
        system: {
            time: UTC,
            appkey: this.appkey,
            language: this.language,             
            sign: md5Sign
        },
        serialNumber: this.serialNumber,
        mapId: mapId,
        targetPointId: targetPointId
    };

    return axios.post(this.endpoint, body, {
      headers: {
        'Content-Type': 'application/json'
      },
      // Optional: set a reasonable timeout
      timeout: 8000
    });
  }
}
