import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PrimaryDataService } from './primary-data.service';

describe('PrimaryDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PrimaryDataService]
    });
  });

  it('should be created', inject([PrimaryDataService], (service: PrimaryDataService) => {
    expect(service).toBeTruthy();
  }));
});
