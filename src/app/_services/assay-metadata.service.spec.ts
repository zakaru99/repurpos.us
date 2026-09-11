import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AssayMetadataService } from './assay-metadata.service';
import { CitationService } from './citation.service';

describe('AssayMetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssayMetadataService, CitationService]
    });
  });

  it('should be created', inject([AssayMetadataService], (service: AssayMetadataService) => {
    expect(service).toBeTruthy();
  }));
});
