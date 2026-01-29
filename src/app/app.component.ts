import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MqttService } from './shared/mqtt.service';
import { ROBOT_CONFIG } from './shared/robot-config';
import { listener } from './shared/mqtt-robot';

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
    // listener.startListening();
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
      hostname: ROBOT_CONFIG.mqtt_hostname,
      port: ROBOT_CONFIG.mqtt_port,
      protocol: 'mqtt',
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 4000,
      clientId: ROBOT_CONFIG.clientId,
      username: ROBOT_CONFIG.username,
      password: ROBOT_CONFIG.token,
      protocolVersion: 4,
    });
    
    // Subscribe to robot topic after connection is established
    // Wait longer to ensure connection is established
    setTimeout(() => {
      if (this.mqttService.getConnectionStatus()) {
        this.mqttService.subscribeToMultipleTopics(['robot-open/1919862081/pub/data', 'robot-topic/1919862081/sub']);
        console.log('✓ MQTT Service ready - listening for robot messages');
      } else {
        console.warn('MQTT not connected yet, retrying...');
        setTimeout(() => {
          this.mqttService.subscribeToMultipleTopics(['robot-open/1919862081/pub/data', 'robot-topic/1919862081/sub']);
        }, 2000);
      }
    }, 2000);
  }
}
