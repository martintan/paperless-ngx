import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordWithStrengthComponent } from './password-with-strength.component';

describe('PasswordWithStrengthComponent', () => {
  let component: PasswordWithStrengthComponent;
  let fixture: ComponentFixture<PasswordWithStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordWithStrengthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordWithStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
