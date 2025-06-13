//Home cloud changes new component

import { TestBed } from '@angular/core/testing';

import { CheckStatusServiceService } from './check-status-service.service';

describe('CheckStatusServiceService', () => {
  let service: CheckStatusServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckStatusServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
