import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { SeatingService } from './seating.service';
import { MessageHandlerService } from '../shared/message-handler.service';
import { Subscription } from 'rxjs';

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
  recognizedCount: number | null = null;
  // Subscription to robot fi observable
  private robotFiSub: Subscription | null = null;

  constructor(
    private seatingService: SeatingService,
    private messageHandler: MessageHandlerService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
     this.recognizedCount = this.messageHandler.getRobotFiRecords().length;;

    // Subscribe to robot fi events emitted by MessageHandlerService (handles case 1108)
    // this.robotFiSub = this.messageHandler.robotFi$.subscribe((fi: any) => {
      // fi may be numeric or string; parse to integer
      // const parsed = parseInt(fi as string, 10);
      // if (!isNaN(parsed)) {
      //   this.ngZone.run(() => {
      //     this.recognizedCount = parsed;
      //     this.message = `Detected ${parsed} customers`;
      //   });
      // }
    // });
  }

  ngOnDestroy(): void {
    // Unsubscribe from robotFi observable
    // if (this.robotFiSub) {
    //   this.robotFiSub.unsubscribe();
    //   this.robotFiSub = null;
    // }
  }

  moveTo(sizeKey: string) {
    const targetPointId = this.targetMap[sizeKey];
    if (!targetPointId) {
      this.message = 'Missing targetPointId for ' + sizeKey;
      return;
    }
    this.loading = true;
    this.message = `Moving robot to ${sizeKey}...`;
    this.seatingService.moveToTarget(targetPointId)
      .then((res: any) => {
        this.loading = false;
        // axios response data usually in res.data
        this.message = 'Robot commanded successfully.';
      })
      .catch((err: any) => {
        this.loading = false;
        // Normalize error message
        const errMsg = err?.response?.data || err?.message || err;
        this.message = 'Error commanding robot: ' + JSON.stringify(errMsg);
      });
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
