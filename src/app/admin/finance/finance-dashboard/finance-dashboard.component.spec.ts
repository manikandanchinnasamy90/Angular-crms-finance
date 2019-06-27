import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { FinanceDashboardComponent } from './finance-dashboard.component';
import { IActionOptions } from '../../display-helpers/display-helpers.module';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AccountsService } from '../services/accounts.service';
import { Component, Input } from '@angular/core';
import { ServiceResponse } from '../../resources/bank-api/bank-api.module';
import { CorporatePlusAccountsList } from '../models/corporarte-plus-account-list';
import { CorporatePlusAccount } from '../models/corporate-plus-account';
import { Scopes } from 'src/app/scopes.enum';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

describe('FinanceDashboardComponent', () => {
  let component: FinanceDashboardComponent;
  let fixture: ComponentFixture<FinanceDashboardComponent>;

  @Component({
    selector: 'app-view-class',
    template: ''
  })
  class ViewClassStubComponent {
    @Input()
    object: any;

    @Input()
    actionOptions: IActionOptions[];

    @Input()
    displayName: string;
  }

  let returnValue: ServiceResponse<CorporatePlusAccountsList>;
  beforeEach(async(() => {
    const activatedRoutStub = jasmine.createSpyObj('activatedRouterStub', ['test']);
    const routerStub = jasmine.createSpyObj('routerStub', ['navigate']);
    const accountServiceStub = jasmine.createSpyObj(['getCorporatePlusAccounts']);

    returnValue = {
      data: new CorporatePlusAccountsList(),
      success: true,
      error: null
    };
    returnValue.data = new CorporatePlusAccountsList();
    returnValue.data.data = [];
    returnValue.data.data.push(new CorporatePlusAccount());
    (accountServiceStub.getCorporatePlusAccounts as jasmine.Spy).and.returnValue(new Promise((r) => { r(returnValue); }));

    TestBed.configureTestingModule({
      declarations: [
        ViewClassStubComponent,
        FinanceDashboardComponent
      ],
      imports: [
        RouterModule,
        NgbAlertModule,
      ],
      providers: [
        {
          provide: Router,
          useValue: routerStub
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoutStub
        },
        {
          provide: AccountsService,
          useValue: accountServiceStub
        }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('callService', () => {
    let service: AccountsService;
    beforeEach(inject(
      [AccountsService],
      (_service: AccountsService) => {
        service = _service;
      }));

    it('should call finance service', fakeAsync(() => {
      // arrange

      // act
      let returned = false;
      component.callService('123').then((result) => {
        // assert
        expect(service.getCorporatePlusAccounts).toHaveBeenCalledWith(false);
        expect(result.data instanceof CorporatePlusAccountsList).toBeTruthy();
        expect(result).toBe(returnValue);

        returned = true;
      });
      tick();
      expect(returned).toBeTruthy();
    }));

    it('should force reload when refreshing', fakeAsync(() => {
      // arranges

      // act
      component.refresh();
      tick();

      // assert
      expect(service.getCorporatePlusAccounts).toHaveBeenCalledWith(true);
    }));
  });

  describe('modelId', () => {
    it('should return', () => {
      // act
      const result = component.modelId;

      // assert
      expect(result).toBe('');
    });
  });

  describe('action options', () => {
    it('should be setup correctly', () => {
      const options = component.actionOptions;
      const matchedOptions = options.filter((o) => o.navigationObject === CorporatePlusAccount);

      expect(matchedOptions[0].buttonText).toEqual('View statement');
      expect(matchedOptions[0].scope).toEqual(Scopes.CorporateViewStatement);
      expect(matchedOptions[0].buttonClass).toEqual('btn-outline-primary');
    });

    it('should navigate to statement view', inject([Router, ActivatedRoute], (router: Router, activatedRoute: ActivatedRoute) => {
      // arrange
      const account = new CorporatePlusAccount();
      account.number = '123';
      account.name = 'test name';

      // act
      const options = component.actionOptions;
      const matchedOptions = options.filter((o) => o.navigationObject === CorporatePlusAccount);
      matchedOptions[0].handler(account);

      // assert
      expect(router.navigate).toHaveBeenCalledWith(['corp-statement', '123'],
        {
          relativeTo: activatedRoute,
          queryParams: { pageNumber: '1', accountName: 'test name' }
        });
    }));
  });

});
