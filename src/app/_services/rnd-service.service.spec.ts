import { TestBed } from '@angular/core/testing';

import { RndServiceService } from './rnd-service.service';

describe('RndServiceService', () => {
  let service: RndServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RndServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
