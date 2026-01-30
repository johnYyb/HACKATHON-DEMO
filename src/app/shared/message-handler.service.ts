import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MessageHandlerService {
  constructor(private router: Router) {}

  /**
   * Handle incoming MQTT messages and navigate accordingly
   * @param topic The topic the message was received on
   * @param message The message content
   */
  handleMessage(topic: string, message: string): void {
    console.log(`Received message on topic ${topic}: ${message}`);

    // Parse the message - expecting format like "order", "pay", "other"
    const route = message.trim().toLowerCase();

    // Navigate based on the message content
    switch (route) {
      case 'order':
        this.router.navigate(['/order']);
        console.log('Navigating to /order');
        break;
      case 'pay':
        this.router.navigate(['/pay']);
        console.log('Navigating to /pay');
        break;
      case 'other':
        this.router.navigate(['/other']);
        console.log('Navigating to /other');
        break;
      default:
        console.warn(`Unknown route: ${route}`);
        // Try to navigate anyway if it's a valid path
        if (route.startsWith('/')) {
          this.router.navigate([route]);
        } else {
          this.router.navigate([`/${route}`]);
        }
    }
  }

  handleRobotMessage(topic: string, message: string): void {
    console.log(`Received robot message on topic ${topic}: ${message}`);
    try {
      const { t, ...rest } = JSON.parse(message);
      switch (t) {
        case '1109':
          {
            const {
              m: { q, s },
            } = rest;
            console.log('received robot voice message:', q, s);
          }
          break;
        case '1204':
          {
            const {
              m: { ti, tn },
            } = rest;
            console.log('received robot get to position message:', ti, tn);
          }
          break;
        default:
          console.warn(`Unknown robot message type: ${t}`);
          break;
      }
    } catch (error) {}
  }
}
