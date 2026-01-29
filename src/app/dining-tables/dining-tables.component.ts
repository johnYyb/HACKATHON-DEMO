import { Component } from '@angular/core';
import { RobotControlService } from '../shared/robot-control.service';

@Component({
  selector: 'app-dining-tables',
  templateUrl: './dining-tables.component.html',
  styleUrls: ['./dining-tables.component.scss']
})
export class DiningTablesComponent {
  tables = Array(4).fill(0);
  robotSerial = 'ROBOT_SERIAL_123'; // 机器人序列号，可以从配置中获取
  
  constructor(private robotControl: RobotControlService) {}

  /**
   * 点击餐桌，引导机器人到该桌
   * @param tableIndex 餐桌索引（0-based）
   */
  onTableClick(tableIndex: number): void {
    const tableNumber = tableIndex + 1;
    const mapId = '1'; // 地图ID，可以根据实际情况配置
    const targetPointId = String(tableNumber + 1); // 目标点ID，假设点ID从2开始对应桌1
    
    console.log(`引导机器人到${tableNumber}号桌`);
    
    this.robotControl.guideToTable(
      this.robotSerial,
      mapId,
      targetPointId,
      String(tableNumber)
    ).subscribe({
      next: (response) => {
        console.log(`成功引导到${tableNumber}号桌:`, response);
        alert(`机器人正在前往${tableNumber}号桌`);
      },
      error: (error) => {
        console.error(`引导到${tableNumber}号桌失败:`, error);
        alert(`引导失败: ${error.message}`);
      }
    });
  }
}
