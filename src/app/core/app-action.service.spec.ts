/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AppActionService } from './app-action.service';

describe('AppActionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppActionService]
    });
  });

  it('should ...', inject([AppActionService], (service: AppActionService) => {
    expect(service).toBeTruthy();
  }));
});
