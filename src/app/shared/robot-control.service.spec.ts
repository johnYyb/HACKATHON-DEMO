import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RobotControlService } from './robot-control.service';

describe('RobotControlService', () => {
  let service: RobotControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RobotControlService]
    });
    service = TestBed.inject(RobotControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
