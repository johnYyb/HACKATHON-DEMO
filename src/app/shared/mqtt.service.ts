import { Injectable } from '@angular/core';
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { MessageHandlerService } from './message-handler.service';

export interface ConnectionConfig {
  hostname: string;
  port: number;
  path?: string;
  clean?: boolean;
  connectTimeout?: number;
  reconnectPeriod?: number;
  clientId?: string;
  username?: string;
  password?: string;
  protocol?: 'ws' | 'wss' | 'mqtt' | 'mqtts';
  protocolVersion?: number
}

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: MqttClient | null = null;
  private isConnected = false;

  constructor(private messageHandler: MessageHandlerService) {}

  /**
   * Connect to MQTT broker
   * @param config Connection configuration
   */
  connect(config: ConnectionConfig): void {
    if (this.isConnected) {
      console.log('Already connected to MQTT broker');
      return;
    }

    // Build connection URL based on protocol
    const protocol = config.protocol || 'ws';
    console.log('Connecting using protocol:', protocol);
    const url = `${protocol}://${config.hostname}:${config.port}${config.path}`;

    const options: IClientOptions = {
      clientId: config.clientId || `angular_client_${Math.random().toString(16).substring(2, 10)}`,
      clean: config.clean !== undefined ? config.clean : true,
      connectTimeout: config.connectTimeout || 30000,
      reconnectPeriod: config.reconnectPeriod || 4000,
      username: config.username,
      password: config.password,
    };
    console.log('Connecting to MQTT broker at:', url, 'with options:', options);
    try {
      this.client = mqtt.connect(url, {...options, protocolVersion: 4});

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('MQTT connection error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('MQTT connection closed');
        this.isConnected = false;
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        // this.messageHandler.handleMessage(topic, message.toString());
        this.messageHandler.handleRobotMessage(topic, message.toString());
      });
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
    }
  }

  /**
   * Subscribe to a topic
   * @param topic Topic to subscribe to
   * @param qos Quality of Service (0, 1, or 2)
   * @param callback Optional callback for handling messages
   */
  subscribe(topic: string, qos: 0 | 1 | 2 = 0, callback?: (topic: string, message: string) => void): void {
    if (!this.client || !this.isConnected) {
      console.error('MQTT client is not connected. Call connect() first.');
      return;
    }

    this.client.subscribe(topic, { qos }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic ${topic}:`, err);
      } else {
        console.log(`Subscribed to topic: ${topic} with QoS ${qos}`);
      }
    });

    // If a custom callback is provided, add a listener for this topic
    if (callback) {
      this.client.on('message', (receivedTopic: string, message: Buffer) => {
        if (receivedTopic === topic) {
          callback(receivedTopic, message.toString());
        }
      });
    }
  }

  /**
   * Subscribe to a topic for navigation messages
   * @param topic Topic to subscribe to (e.g., 'navigation' or 'app/navigation')
   */
  subscribeToNavigation(topic: string = 'hackathon/demo/navigation'): void {
    if (!this.client || !this.isConnected) {
      console.error('MQTT client is not connected. Cannot subscribe to navigation.');
      return;
    }
    console.log(`Subscribing to navigation topic: ${topic}`);
    this.subscribe(topic, 0);
  }

  /**
   * Subscribe to multiple topics
   * @param topics Array of topics to subscribe to
   */
  subscribeToMultipleTopics(topics: string[]): void {
    if (!this.client || !this.isConnected) {
      console.error('MQTT client is not connected. Call connect() first.');
      return;
    }

    topics.forEach(topic => {
      console.log(`Subscribing to topic: ${topic}`);
      this.client!.subscribe(topic,{qos: 0}, (err) => {
        if (err) {
          console.error(`Failed to subscribe to topic ${topic}:`, err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  /**
   * Publish a message to a topic
   * @param topic Topic to publish to
   * @param message Message to publish
   * @param qos Quality of Service (0, 1, or 2)
   * @param retain Retain flag
   */
  publish(topic: string, message: string, qos: 0 | 1 | 2 = 0, retain: boolean = false): void {
    if (!this.client || !this.isConnected) {
      console.error('MQTT client is not connected. Call connect() first.');
      return;
    }

    this.client.publish(topic, message, { qos, retain }, (err) => {
      if (err) {
        console.error(`Failed to publish to topic ${topic}:`, err);
      } else {
        console.log(`Published message to ${topic}: ${message}`);
      }
    });
  }

  /**
   * Unsubscribe from a topic
   * @param topic Topic to unsubscribe from
   */
  unsubscribe(topic: string): void {
    if (!this.client) {
      console.error('MQTT client is not available.');
      return;
    }

    this.client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to unsubscribe from topic ${topic}:`, err);
      } else {
        console.log(`Unsubscribed from topic: ${topic}`);
      }
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      try {
        this.client.end(true);
        this.isConnected = false;
        this.client = null;
        console.log('Successfully disconnected from MQTT broker');
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  }

  /**
   * Check if connected to MQTT broker
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
