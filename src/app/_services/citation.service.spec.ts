import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CitationService } from './citation.service';

describe('CitationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CitationService]
    });
  });

  it('should be created', inject([CitationService], (service: CitationService) => {
    expect(service).toBeTruthy();
  }));
});
