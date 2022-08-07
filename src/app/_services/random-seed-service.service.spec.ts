import { TestBed } from '@angular/core/testing';

import { RandomSeedServiceService } from './random-seed-service.service';

describe('RandomSeedServiceService', () => {
  let service: RandomSeedServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomSeedServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
