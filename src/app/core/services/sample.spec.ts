import { TestBed } from '@angular/core/testing';

import { Sample } from './sample';

describe('Sample', () => {
  let service: Sample;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sample);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
