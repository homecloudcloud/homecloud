/**Home cloud changes new component**/

import { TestBed } from '@angular/core/testing';

import { SaveFlagsServiceService } from './save-flags-service.service';

describe('SaveFlagsServiceService', () => {
  let service: SaveFlagsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveFlagsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
