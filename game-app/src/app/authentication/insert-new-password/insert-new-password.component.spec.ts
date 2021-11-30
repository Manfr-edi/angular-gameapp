import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertNewPasswordComponent } from './insert-new-password.component';

describe('InsertNewPasswordComponent', () => {
  let component: InsertNewPasswordComponent;
  let fixture: ComponentFixture<InsertNewPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertNewPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertNewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
