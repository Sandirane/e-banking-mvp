import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorAccountComponent } from './monitor-account.component';

describe('MonitorAccountComponent', () => {
  let component: MonitorAccountComponent;
  let fixture: ComponentFixture<MonitorAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
