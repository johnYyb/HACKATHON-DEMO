import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RobotControlService } from './robot-control.service';
import { ROBOT_CONFIG } from './robot-config';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageHandlerService {
  constructor(private router: Router, private robotControlService: RobotControlService) {}

  public isSubmitOrder = false;
  // Collected m.fi values from robot messages of type 1108
  private robotFiRecords: any[] = [];
  // Emits each new fi value as it arrives
  // public robotFi$ = new Subject<any>();

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
      case 'seating':
        this.router.navigate(['/seating']);
        console.log('Navigating to /seating');
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
    try {``
      const { t, ...rest } = JSON.parse(message);
      switch (t) {
        case '1108':
          {
            const {
              m: {},
              id: id,
            } = rest;
            console.log('received robot customer image:');
            // store fi in records and emit to subscribers
            if (id !== undefined && id !== null) {
              this.robotFiRecords.push(id);
              // try { this.robotFi$.next(id); } catch (e) { /* ignore emit errors */ }
            }
          }
          break;
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
            if(tn === ROBOT_CONFIG.pointB && this.isSubmitOrder){ // 假设pointB是用餐区
              this.robotControlService.speak(ROBOT_CONFIG.serialNumber, `Here are your dishes. Enjoy your meal. Let me know if you need anything else.`).subscribe({
                next: (response) => {
                  console.log('Arrived speech completed:', response);
                },
                error: (error) => {
                  console.log('Arrived speech failed:', error);
                }
              });
            }
          }
          break;
        default:
          console.warn(`Unknown robot message type: ${t}`);
          break;
      }
    } catch (error) {}
  }

  /** Return a shallow copy of stored fi records */
  getRobotFiRecords(): any[] {
    return this.robotFiRecords.slice();
  }

  /** Clear stored fi records */
  clearRobotFiRecords(): void {
    this.robotFiRecords = [];
  }
}
