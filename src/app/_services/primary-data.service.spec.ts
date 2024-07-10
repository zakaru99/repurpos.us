import { TestBed, inject } from '@angular/core/testing';

import { PrimaryDataService } from './primary-data.service';

describe('PrimaryDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrimaryDataService]
    });
  });

  it('should be created', inject([PrimaryDataService], (service: PrimaryDataService) => {
    expect(service).toBeTruthy();
  }));
});
