import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MqttService } from './shared/mqtt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'hackathon-demo';
  animatingPane: 'order' | 'pay' | 'other' | null = null;
  
  constructor(
    public router: Router,
    private mqttService: MqttService
  ) {}

  ngOnInit() {
    // this.connectToDemo();
    // this.connectRobotMqtt();
  }

  ngOnDestroy() {
    // Clean up MQTT connection when component is destroyed
    this.mqttService.disconnect();
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  showDiningTables(): boolean {
    // Show dining tables only on specific routes, e.g., '/order', '/pay', '/other'
    return ['/order', '/pay'].includes(this.router.url);
  }

  // test ng.getComponent(document.querySelector('app-root')).publishNavigationMessage('pay')

  // Test method to publish MQTT messages
  publishNavigationMessage(route: 'order' | 'pay' | 'other') {
    if (!this.mqttService.getConnectionStatus()) {
      console.error('MQTT not connected! Cannot publish message.');
      return;
    }
    this.mqttService.publish('hackathon/demo/navigation', route);
    console.log(`✓ Published "${route}" to navigation topic`);
  }

  triggerPaneAnimation(pane: 'order' | 'pay' | 'other') {
    this.animatingPane = pane;
    setTimeout(() => {
      this.animatingPane = null;
    }, 400); // Animation duration
  }
  
  paneNavigate(pane: 'order' | 'pay' | 'other') {
    this.triggerPaneAnimation(pane);
    setTimeout(() => {
      this.router.navigate(['/' + pane]);
    }, 200); // Start navigation after animation begins
  }

  connectToDemo(){
// Connect to MQTT broker with configuration
    // Update the configuration to match your MQTT broker
    this.mqttService.connect({
      hostname: 'broker.emqx.io',
      port: 8083,
      path: '/mqtt',
      protocol: 'ws',
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 4000,
      clientId: `angular_client_${Math.random().toString(16).substring(2, 10)}`,
      username: 'emqx_test',
      password: 'emqx_test',
    });
    
    // Subscribe to navigation topic after connection is established
    // Messages like "order", "pay", "other" will trigger navigation
    // Wait longer to ensure connection is established
    setTimeout(() => {
      if (this.mqttService.getConnectionStatus()) {
        this.mqttService.subscribeToNavigation('hackathon/demo/navigation');
        console.log('✓ MQTT Service ready - listening for navigation messages');
      } else {
        console.warn('MQTT not connected yet, retrying...');
        setTimeout(() => {
          this.mqttService.subscribeToNavigation('hackathon/demo/navigation');
        }, 2000);
      }
    }, 2000);
  }

  connectRobotMqtt() {
    // Connect to MQTT broker with configuration
    // Update the configuration to match your MQTT broker
    this.mqttService.connect({
      hostname: 'post-cn-i7m25yinr0c.mqtt.aliyuncs.com',
      port: 1883,
      path: '/',
      protocol: 'mqtt',
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 4000,
      clientId: `GID_Robot_Open@@@a825a2fbb88f470ca3e32ba9a49beffb`,
      username: 'Token|LTAI5tRs6q8KJonwMXcvGABe|post-cn-i7m25yinr0c',
      password: 'R|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGU1P28HAMaxYxn8aQbALNtml7QZKl9L9kPTa0WZpLnkfkoSNklzDfrQejZwDUSzsd4X4qaD3n2TrADZbyy8RH08HNIsA2iv1DoYbz7MJWZDYC3DlW7gLEr35K6sQYWM6qmNXkyJduQm4vgS3Asj/GrCjhKOSZxhr49sLa92z2q6Q8sFLJD9ZhOGElzeSozsSru8LRVkiv/buUr4cJXFoNycvRILssyLnFo+jvs/wM1Vix3vRV3RTR92eAPP5+wbnIAPuCXnW8DfiizoJQRD4wfMmjlVmd5bi/pcL2dZ4dfsrzQ7q+05T0zxCflWuGQ/QXW6Zs6hizc18z5ZhkhDHimRWJCjqqqTGBscU8mf3miA9pr71x608Hleq1rkjdnM0Lt|W|LzMT+XLFl5s/YWJ/MlDz4t/Lq5HC1iGUbrBXN77FaXpn8aQbALNtml7QZKl9L9kPTa0WZpLnkfkoSNklzDfrQejZwDUSzsd4X4qaD3n2TrADZbyy8RH08HNIsA2iv1DoYbz7MJWZDYC3DlW7gLEr35K6sQYWM6qmNXkyJduQm4vgS3Asj/GrCjhKOSZxhr49sLa92z2q6Q8sFLJD9ZhOGElzeSozsSru8LRVkiv/buVz4xDJzgSCJtfL390UDKpcgiQfES++LgHOmbDgt2heSSBbgcB6OwseyoMqS6Htp9Cjhc34yw3pVXC9nWeHX7K80O6vtOU9M8Qn5VrhkP0F1umbOoYs3NfM+WYZIQx4pkViQo6qqkxgbHFPJn95ogPaa+9cetPB5Xqta5I3ZzNC7Q==',
    });
    
    // Subscribe to navigation topic after connection is established
    // Wait longer to ensure connection is established
    setTimeout(() => {
      if (this.mqttService.getConnectionStatus()) {
        this.mqttService.subscribeToMultipleTopics(['robot-topic/1919862081/sub']);
        console.log('✓ MQTT Service ready - listening for navigation messages');
      } else {
        console.warn('MQTT not connected yet, retrying...');
        setTimeout(() => {
          this.mqttService.subscribeToMultipleTopics(['robot-topic/1919862081/sub']);
        }, 2000);
      }
    }, 2000);
  }
}
