import { Component } from '@angular/core';
import { RobotControlService } from '../shared/robot-control.service';
import { ROBOT_CONFIG } from '../shared/robot-config';

@Component({
  selector: 'app-dining-tables',
  templateUrl: './dining-tables.component.html',
  styleUrls: ['./dining-tables.component.scss'],
})
export class DiningTablesComponent {
  tables = [
    { state: 'idle' },
    { state: 'idle' },
    { state: 'inuse' },
    { state: 'idle' },
  ];
  robotSerial = ROBOT_CONFIG.serialNumber; // 机器人序列号，可以从配置中获取

  constructor(private robotControl: RobotControlService) {}

  onTableClick(tableIndex: number): void {
    // Example: Toggle state for demo (remove in production)
    this.tables[tableIndex].state =
      this.tables[tableIndex].state === 'idle' ? 'inuse' : 'idle';

    const tableNumber = tableIndex + 1;
    const mapId = ROBOT_CONFIG.mapId;
    const pointArray = [
      ROBOT_CONFIG.pointA,
      ROBOT_CONFIG.pointB,
      ROBOT_CONFIG.pointC,
    ];
    const targetPointId = String(pointArray[tableIndex]);

    console.log(`引导机器人到${tableNumber}号桌`);

    this.robotControl
      .guideToTable(this.robotSerial, mapId, targetPointId, String(tableNumber))
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
  }
}
