/**Home cloud changes new component**/

import { TestBed } from '@angular/core/testing';

import { ReadFlagServiceService } from './read-flag-service.service';

describe('ReadFlagServiceService', () => {
  let service: ReadFlagServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadFlagServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
