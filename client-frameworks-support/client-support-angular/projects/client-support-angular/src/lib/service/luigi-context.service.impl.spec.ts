import { TestBed } from '@angular/core/testing';
import { LuigiContextServiceImpl } from './luigi-context.service.impl';

describe('LuigiContextService', () => {
  let service: LuigiContextServiceImpl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LuigiContextServiceImpl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
