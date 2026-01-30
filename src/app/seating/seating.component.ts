import { Component } from '@angular/core';
import { SeatingService } from './seating.service';

@Component({
  selector: 'app-seating',
  templateUrl: './seating.component.html',
  styleUrls: ['./seating.component.scss']
})
export class SeatingComponent {
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

  constructor(private seatingService: SeatingService) {}

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
}
