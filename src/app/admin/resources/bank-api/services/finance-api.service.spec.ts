import { TestBed, inject } from '@angular/core/testing';

import { FinanceApiService } from './finance-api.service';

describe('FinanceApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinanceApiService]
    });
  });

  it('should be created', inject([FinanceApiService], (service: FinanceApiService) => {
    expect(service).toBeTruthy();
  }));
});
