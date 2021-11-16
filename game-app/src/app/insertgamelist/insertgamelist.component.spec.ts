import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertgamelistComponent } from './insertgamelist.component';

describe('InsertgamelistComponent', () => {
  let component: InsertgamelistComponent;
  let fixture: ComponentFixture<InsertgamelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertgamelistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertgamelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
