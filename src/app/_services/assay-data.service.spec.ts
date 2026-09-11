import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssayDataService } from './assay-data.service';
import { StructureSvgService } from './structure-svg.service';

describe('AssayDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssayDataService, StructureSvgService]
    });
  });

  it('should be created', inject([AssayDataService], (service: AssayDataService) => {
    expect(service).toBeTruthy();
  }));
});
