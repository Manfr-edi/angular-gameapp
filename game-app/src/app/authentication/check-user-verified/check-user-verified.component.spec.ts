import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckUserVerifiedComponent } from './check-user-verified.component';

describe('CheckUserVerifiedComponent', () => {
  let component: CheckUserVerifiedComponent;
  let fixture: ComponentFixture<CheckUserVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckUserVerifiedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckUserVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
