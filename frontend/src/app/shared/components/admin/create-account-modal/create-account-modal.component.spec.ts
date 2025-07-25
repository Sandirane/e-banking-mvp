import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountModalComponent } from './create-account-modal.component';

describe('CreateAccountModalComponent', () => {
  let component: CreateAccountModalComponent;
  let fixture: ComponentFixture<CreateAccountModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAccountModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAccountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
