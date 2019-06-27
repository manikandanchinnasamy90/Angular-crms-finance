import { async, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { ApiModelBase, ServiceResponse, GetViewCorporateStatementRequest } from '../../../resources/bank-api/bank-api.module';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { ApiSearchBaseComponent } from './api-search-base.component';
import { FormPropertiesService } from '../../services/form-properties.service';
import { QueryParametersService } from 'src/app/admin/shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { CsvExportService } from '../../display-helpers.module';

@Component({ template: '' })
export class StubComponent {

}

class QueryParametersServiceStub {
  get currentSearchPage() {
    return '';
  }
}

describe('ApiSearchBaseComponent', () => {
  let component: ApiSearchBaseComponent<ApiModelBase, ApiModelBase>;

  beforeEach(async(() => {
    const serviceStub = jasmine.createSpyObj(['displayToFormProperties']);

    const userApiServiceStub = jasmine.createSpyObj(['searchUsers']);
    (userApiServiceStub.searchUsers as jasmine.Spy).and.returnValue(new Promise(() => { }));

    const activatedRouterStub = jasmine.createSpyObj(['test']);

    TestBed.configureTestingModule({
      declarations: [
        StubComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([{
          path: 'path/:userId',
          component: StubComponent
        }])
      ],
      providers: [
        {
          provide: FormPropertiesService,
          useValue: serviceStub
        },
        {
          provide: CsvExportService,
          useValue: jasmine.createSpyObj(['dataToCsv'])
        },
        {
          provide: QueryParametersService,
          useClass: QueryParametersServiceStub
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouterStub
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouterStub
        },
        {
          provide: NgbModal,
          useValue: jasmine.createSpyObj(['open'])
        }
      ]

    })
      .compileComponents();
  }));

  beforeEach(inject(
    [FormPropertiesService, CsvExportService, QueryParametersService, Router, ActivatedRoute, NgbModal],
    (formPropertiesService: FormPropertiesService,
      csvExportService: CsvExportService,
      queryParameterService: QueryParametersService,
      router: Router,
      activatedRouter: ActivatedRoute,
      modalService: NgbModal, ) => {
      component = new ApiSearchBaseComponent<ApiModelBase, ApiModelBase>(
        formPropertiesService,
        csvExportService,
        queryParameterService,
        router,
        activatedRouter,
        modalService
      );
    }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload data when route changes', fakeAsync(() => {
    // arrange
    spyOn(component, 'submit');
    const router = TestBed.get(Router);
    component.model = new GetViewCorporateStatementRequest();
    component.ngOnInit();

    // act
    router.navigate(['path', 'testToTriggerRouting']);
    tick();

    // assert
    expect(component.submit).toHaveBeenCalledTimes(1);

  }));

  it('should not load data on first load (before ngOnInit)', fakeAsync(() => {
    // arrange
    spyOn(component, 'submit');
    const router = TestBed.get(Router);

    // act
    router.navigate(['path', 'testToTriggerRouting']);
    tick();

    // assert
    expect(component.submit).not.toHaveBeenCalled();

  }));

  describe('previousPage', () => {
    it('should navigate to the previous page', inject(
      [ActivatedRoute, QueryParametersService],
      (activatedRoute: ActivatedRoute, queryParametersService: QueryParametersService) => {
        // arrange
        const routerStub = jasmine.createSpyObj('router', ['navigate']);
        component['router'] = routerStub;
        spyOnProperty(queryParametersService, 'currentSearchPage', 'get').and.returnValue(10);

        // act
        component.previousPage();

        expect(routerStub.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            pageNumber: 9
          }
        });
      }));

    it('should navigate not go past default page number', inject(
      [ActivatedRoute, QueryParametersService],
      (activatedRoute: ActivatedRoute, queryParametersService: QueryParametersService) => {
        const routerStub = jasmine.createSpyObj('router', ['navigate']);
        component['router'] = routerStub;
        component.defaultPageNumber = 10;
        spyOnProperty(queryParametersService, 'currentSearchPage', 'get').and.returnValue(10);

        // act
        component.previousPage();

        expect(routerStub.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            pageNumber: 10
          }
        });
      }));
  });
  describe('nextPage', () => {
    it('should navigate to the next page', inject(
      [ActivatedRoute, QueryParametersService],
      (activatedRoute: ActivatedRoute, queryParametersService: QueryParametersService) => {
        // arrange
        const routerStub = jasmine.createSpyObj('router', ['navigate']);
        component['router'] = routerStub;
        spyOnProperty(queryParametersService, 'currentSearchPage', 'get').and.returnValue(10);

        // act
        component.nextPage();

        expect(routerStub.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            pageNumber: 11
          }
        });
      }));
  });

  describe('execute search', () => {
    it('should reset page number', inject(
      [ActivatedRoute, QueryParametersService],
      (activatedRoute: ActivatedRoute, queryParametersService: QueryParametersService) => {
        // arrange
        const routerStub = jasmine.createSpyObj('router', ['navigate']);
        component['router'] = routerStub;
        component.defaultPageNumber = 2;
        spyOnProperty(queryParametersService, 'currentSearchPage', 'get').and.returnValue(10);

        // act
        component.executeSearch();

        // assert
        expect(routerStub.navigate).toHaveBeenCalledWith([], {
          relativeTo: activatedRoute,
          queryParams: {
            pageNumber: 2
          }
        });
      }));

    it('should call submit if the page is already default page number', inject(
      [QueryParametersService],
      (queryParametersService: QueryParametersService) => {
        // arrange
        spyOn(component, 'submit');
        component.defaultPageNumber = 1;
        spyOnProperty(queryParametersService, 'currentSearchPage', 'get').and.returnValue(1);

        // act
        component.executeSearch();

        // assert
        expect(component.submit).toHaveBeenCalledWith();
      }));
  });

  describe('OnDestroy', () => {
    it('should unsubscribe to route change events', fakeAsync(() => {
      // arrange
      spyOn(component, 'submit');
      const router = TestBed.get(Router);

      // act
      component.ngOnDestroy();
      router.navigate(['path', 'testToTriggerRouting']);
      tick();

      // assert
      expect(component.submit).not.toHaveBeenCalled();
    }));

    it('should handle null route change events', fakeAsync(() => {
      // arrange
      spyOn(component, 'submit');
      TestBed.get(Router);

      component['_routeChangeSubscription'] = null;

      // act
      component.ngOnDestroy();
    }));
  });

  describe('onDownloadRequested', () => {
    let modalService: NgbModal;
    let downloadResolver: (data: ServiceResponse<any[]>) => void;
    beforeEach(inject([NgbModal], (_modalService: NgbModal) => {
      modalService = _modalService;
      spyOn(component, 'getExportData').and.callFake(() => {
        return new Promise((r) => {
          downloadResolver = r;
        });
      });
    }));
    it('should set loading states', () => {
      // arrange
      const modalContent = {};
      component.downloadAborting = true;
      component.generatingDownload = false;
      component.loading = false;

      // act
      component.onDownloadRequested(null, modalContent);

      // assert
      expect(component.downloadAborting).toBeFalsy();
      expect(component.generatingDownload).toBeTruthy();
      expect(component.loading).toBeTruthy();
    });

    it('should open modal', () => {
      // arrange
      const modalContent = {};

      // act
      component.onDownloadRequested(null, modalContent);

      // assert
      expect(modalService.open).toHaveBeenCalledWith(modalContent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
    });

    it('should download csv when successful', fakeAsync(() => {
      // arrange
      spyOn(component, 'dataToCsv');

      const modalOpenResult = jasmine.createSpyObj(['close']);
      (modalService.open as jasmine.Spy).and.returnValue(modalOpenResult);

      const modalContent = {};
      const result: ServiceResponse<any[]> = {
        success: true,
        error: null,
        data: [1, 2, 3]
      };
      // act
      component.onDownloadRequested(null, modalContent);
      tick();
      // assert before
      expect(component.dataToCsv).not.toHaveBeenCalled();
      expect(component.generatingDownload).toBeTruthy();
      expect(component.loading).toBeTruthy();
      expect(modalOpenResult.close).not.toHaveBeenCalled();

      // act 2
      downloadResolver(result);
      tick();

      // assert after
      expect(component.dataToCsv).toHaveBeenCalledWith([1, 2, 3]);
      expect(component.generatingDownload).toBeFalsy();
      expect(component.loading).toBeFalsy();
      expect(modalOpenResult.close).toHaveBeenCalled();
    }));

    it('should handle error scenario', fakeAsync(() => {
      // arrange
      spyOn(component, 'dataToCsv');

      const modalOpenResult = jasmine.createSpyObj(['close']);
      (modalService.open as jasmine.Spy).and.returnValue(modalOpenResult);

      const modalContent = {};
      const result: ServiceResponse<any[]> = {
        success: false,
        error: { status: 0, error: null } as HttpErrorResponse,
        data: [1, 2, 3]
      };
      // act
      component.onDownloadRequested(null, modalContent);
      tick();
      // assert before
      expect(component.generatingDownload).toBeTruthy();
      expect(component.loading).toBeTruthy();
      expect(modalOpenResult.close).not.toHaveBeenCalled();

      // act 2
      downloadResolver(result);
      tick();

      // assert after
      expect(component.error).toBe(result.error);
      expect(component.dataToCsv).not.toHaveBeenCalled();
      expect(component.generatingDownload).toBeFalsy();
      expect(component.loading).toBeFalsy();
      expect(modalOpenResult.close).toHaveBeenCalled();
    }));

    it('should use error object where available', fakeAsync(() => {
      // arrange
      spyOn(component, 'dataToCsv');

      const modalOpenResult = jasmine.createSpyObj(['close']);
      (modalService.open as jasmine.Spy).and.returnValue(modalOpenResult);

      const modalContent = {};
      const result: ServiceResponse<any[]> = {
        success: false,
        error: {
          status: 0,
          error: {
            result: {
              responseCode: '123',
              responseDescription: 'Description'
            },
          }
        } as HttpErrorResponse,
        data: [1, 2, 3]
      };
      // act
      component.onDownloadRequested(null, modalContent);
      tick();
      downloadResolver(result);
      tick();

      // assert after
      expect(component.errorObject.result.responseCode).toBe('123');
      expect(component.errorObject.result.responseDescription).toBe('Description');
    }));

    it('should support error.error being a string', fakeAsync(() => {
      // arrange
      spyOn(component, 'dataToCsv');

      const modalOpenResult = jasmine.createSpyObj(['close']);
      (modalService.open as jasmine.Spy).and.returnValue(modalOpenResult);

      const modalContent = {};
      const result: ServiceResponse<any[]> = {
        success: false,
        error: {
          status: 0, error: {
            error: 'test',
          }
        } as HttpErrorResponse,
        data: [1, 2, 3]
      };
      // act
      component.onDownloadRequested(null, modalContent);
      tick();
      downloadResolver(result);
      tick();

      // assert after
      expect(component.error).toBe(result.error);
    }));

    it('should support error.error being null', fakeAsync(() => {
      // arrange
      spyOn(component, 'dataToCsv');

      const modalOpenResult = jasmine.createSpyObj(['close']);
      (modalService.open as jasmine.Spy).and.returnValue(modalOpenResult);

      const modalContent = {};
      const result: ServiceResponse<any[]> = {
        success: false,
        error: undefined,
        data: [1, 2, 3]
      };
      // act
      component.onDownloadRequested(null, modalContent);
      tick();
      downloadResolver(result);
      tick();

      // assert after
      expect(component.error).toBe(result.error);
    }));
  });

  describe('dataToCsv', () => {
    let csvService: CsvExportService;
    beforeEach(inject([CsvExportService], (_csvService: CsvExportService) => {
      csvService = _csvService;

      (csvService.dataToCsv as jasmine.Spy).and.returnValue(new Promise((r) => r(true)));
    }));

    it('should should call csv service', fakeAsync(() => {
      // arrange
      component.downloadFileName = 'test';
      // act
      let tested = false;
      component.dataToCsv([{ a: 1, b: 2, c: 3 } as any, { a: 3, b: 4, c: 5 } as any]).then((result) => {
        expect(result).toBeTruthy();
        tested = true;
      });
      tick();

      // assert
      expect(tested).toBeTruthy();
      expect(csvService.dataToCsv).toHaveBeenCalledWith([{ a: 1, b: 2, c: 3 } as any, { a: 3, b: 4, c: 5 } as any], 'test');
    }));
  });

  describe('override methods', () => {

    it('getExportDate should throw error', fakeAsync(() => {
      let tested = false;
      component.getExportData().then(() => {
        expect(false).toBeTruthy('should not reach this code');
      }).catch((error) => {
        expect(error.message).toBe('Not Implemented');
        tested = true;
      });
      tick();

      expect(tested).toBeTruthy();
    }));

    it('getExportDate should throw error', fakeAsync(() => {
      expect(component.cancelDownload).toThrowError('Not Implemented');
    }));
  });
});
