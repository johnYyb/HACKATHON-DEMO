import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { SeatingService } from './seating.service';
import { MessageHandlerService } from '../shared/message-handler.service';
import { Subscription } from 'rxjs';
import { ROBOT_CONFIG } from '../shared/robot-config';
import { RobotControlService } from '../shared/robot-control.service';

@Component({
  selector: 'app-seating',
  templateUrl: './seating.component.html',
  styleUrls: ['./seating.component.scss']
})
export class SeatingComponent implements OnInit, OnDestroy {
  loading = false;
  message = '';

  // Mapping of button labels to targetPointId values.
  // NOTE: I inferred placeholder IDs here. Replace with real targetPointId values if you have them.
  targetMap: { [key: string]: string } = {
    '2-person': 'TP_2',
    '4-person': 'TP_4',
    '6-person': 'TP_6',
    '8-person': 'TP_8'
  };

  // Sizes array used by template for iteration and display
  sizes = [
    { key: '2-person', label: '2-person', capacity: 2 },
    { key: '4-person', label: '4-person', capacity: 4 },
    { key: '6-person', label: '6-person', capacity: 6 },
    { key: '8-person', label: '8-person', capacity: 8 }
  ];

  // Detected customer count from robot camera (null = unknown)
  recognizedCount: number = 0;
  // Subscription to robot fi observable
  private robotFiSub: Subscription | null = null;
  // Interval id used for polling stored records (if polling approach is used)
  private pollIntervalId: number | null = null;

  getRecognizedCount(): number {
    return this.recognizedCount;
  }

  constructor(
    private seatingService: SeatingService,
    private messageHandler: MessageHandlerService,
    private ngZone: NgZone,
    private robotControl: RobotControlService,
  ) {}

  ngOnInit(): void {
    // Start polling approach (keeps a count of stored m.fi records)
    // We store the interval id so it can be cleared when the component is destroyed
    this.startPolling();

    // Subscribe to robot fi events emitted by MessageHandlerService (handles case 1108)
    // this.robotFiSub = this.messageHandler.robotFi$.subscribe((fi: any) => {
    //   const parsed = parseInt(fi as string, 10);
    //   if (!isNaN(parsed)) {
    //     this.ngZone.run(() => {
    //       this.recognizedCount = parsed;
    //       this.message = `Detected ${parsed} customers`;
    //     });
    //   }
    // });
  }

  ngOnDestroy(): void {
    // Stop polling and clean up
    this.stopPolling();
    // Clear stored records if you want to reset on leaving the page
    this.messageHandler.clearRobotFiRecords();
    //Unsubscribe from robotFi observable (if used)
    if (this.robotFiSub) {
      this.robotFiSub.unsubscribe();
      this.robotFiSub = null;
    }
  }

  /** Start polling stored records every second. */
  startPolling(intervalMs: number = 1000) {
    if (this.pollIntervalId != null) return; // already polling
    this.pollIntervalId = window.setInterval(() => {
      // read the number of stored fi records and update recognizedCount
      this.recognizedCount = this.messageHandler.getRobotFiRecords().length;
    }, intervalMs) as unknown as number;
  }

  /** Stop the polling interval if running. */
  stopPolling() {
    if (this.pollIntervalId != null) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  moveTo(sizeKey: string) {
        // Example: Toggle state for demo (remove in production)
      // this.tables[tableIndex].state =
      //   this.tables[tableIndex].state === 'idle' ? 'inuse' : 'idle';
  
      // const tableNumber = tableIndex + 1;
      const mapId = ROBOT_CONFIG.mapId;
      // const pointArray = [
      //   ROBOT_CONFIG.pointA,
      //   ROBOT_CONFIG.pointB,
      //   ROBOT_CONFIG.pointC,
      // ];
      const targetPointId: string = ROBOT_CONFIG.diningAreaPointId as string;
  
      // console.log(`引导机器人到${tableNumber}号桌`);
      const tableNumber = 2;
      this.robotControl
        .guideToTable(ROBOT_CONFIG.serialNumber, mapId, targetPointId )
        .subscribe({
          next: (response) => {
            console.log(`成功引导到${tableNumber}号桌:`, response);
            console.log(`机器人正在前往${tableNumber}号桌`);
          },
          error: (error) => {
            console.error(`引导到${tableNumber}号桌失败:`, error);
            console.log(`引导失败: ${error.message}`);
          },
        });


    // const targetPointId = this.targetMap[sizeKey];
    // if (!targetPointId) {
    //   this.message = 'Missing targetPointId for ' + sizeKey;
    //   return;
    // }
    // this.loading = true;
    // this.message = `Moving robot to ${sizeKey}...`;
    // this.seatingService.moveToTarget(targetPointId)
    //   .then((res: any) => {
    //     this.loading = false;
    //     // axios response data usually in res.data
    //     this.message = 'Robot commanded successfully.';
    //   })
    //   .catch((err: any) => {
    //     this.loading = false;
    //     // Normalize error message
    //     const errMsg = err?.response?.data || err?.message || err;
    //     this.message = 'Error commanding robot: ' + JSON.stringify(errMsg);
    //   });
  }

  /**
   * Confirm the detected count and trigger moveTo for the appropriate table size.
   */
  confirmDetected() {
    if (this.recognizedCount === null) {
      this.message = 'No detected customer count to confirm.';
      return;
    }
    const sizeKey = this.chooseSizeKeyForCount(this.recognizedCount);
    if (!sizeKey) {
      this.message = 'No suitable table size found for count ' + this.recognizedCount;
      return;
    }
    // Call existing moveTo flow
    this.moveTo(sizeKey);
  }

  /**
   * Choose an appropriate sizeKey based on numeric count.
   */
  chooseSizeKeyForCount(count: number): string | null {
    if (count <= 2) return '2-person';
    if (count <= 4) return '4-person';
    if (count <= 6) return '6-person';
    if (count <= 8) return '8-person';
    return '8-person';
  }
}
