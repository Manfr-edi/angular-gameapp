import { TestBed } from '@angular/core/testing';

import { GameListService } from './game-list.service';

describe('GameListService', () => {
  let service: GameListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
