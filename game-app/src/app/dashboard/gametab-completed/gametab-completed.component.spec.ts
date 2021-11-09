import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GametabCompletedComponent } from './gametab-completed.component';

describe('GametabCompletedComponent', () => {
  let component: GametabCompletedComponent;
  let fixture: ComponentFixture<GametabCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GametabCompletedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GametabCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
