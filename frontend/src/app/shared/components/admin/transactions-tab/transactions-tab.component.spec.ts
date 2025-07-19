import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsTabComponent } from './transactions-tab.component';

describe('TransactionsTabComponent', () => {
  let component: TransactionsTabComponent;
  let fixture: ComponentFixture<TransactionsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
