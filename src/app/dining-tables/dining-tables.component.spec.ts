import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiningTablesComponent } from './dining-tables.component';

describe('DiningTablesComponent', () => {
  let component: DiningTablesComponent;
  let fixture: ComponentFixture<DiningTablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiningTablesComponent]
    });
    fixture = TestBed.createComponent(DiningTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
