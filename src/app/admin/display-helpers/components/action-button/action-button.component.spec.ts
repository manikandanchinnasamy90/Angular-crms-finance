import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { ActionButtonComponent } from './action-button.component';
import { ApiModelBase } from '../../../resources/bank-api/bank-api.module';
import { AuthService } from 'src/app/auth.service';
import { Scopes } from 'src/app/scopes.enum';

describe('ActionButtonComponent', () => {
  let component: ActionButtonComponent<ApiModelBase>;
  let fixture: ComponentFixture<ActionButtonComponent<ApiModelBase>>;

  beforeEach(async(() => {
    const authServiceMock = jasmine.createSpyObj(['hasScope']);

    TestBed.configureTestingModule({
      declarations: [
        ActionButtonComponent
      ],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // assert
    expect(component).toBeTruthy();
    expect(component.loading).toBe(false);
    expect(component.result).toBeNull();
    expect(component.resultMessage).toBeNull();
  });

  describe('handleClick', () => {
    let resolver: (value: string | boolean) => void;
    beforeEach(() => {
      component.actionOption = {
        navigationObject: null,
        buttonText: '',
        buttonClass: '',
        handler: () => {
          return new Promise<boolean | string>((r) => {
            resolver = r;
          });
        }
      };

      spyOn(component.actionOption, 'handler').and.callThrough();
    });
    it('should set loading and clear results', fakeAsync(() => {
      // arrange
      component.result = true;
      component.resultMessage = 'test';

      // act
      component.handleClick();

      // assert
      expect(component.loading).toBe(true);
      expect(component.result).toBeNull();
      expect(component.resultMessage).toBeNull();
    }));

    it('should call the handler', fakeAsync(() => {
      // arrange
      component.item = new ApiModelBase();

      // act
      component.handleClick();

      // assert
      expect(component.actionOption.handler).toHaveBeenCalledWith(component.item);
    }));

    it('should handle success results', fakeAsync(() => {
      // arrange

      // act
      component.handleClick();
      resolver(true);
      tick();

      // assert
      expect(component.result).toBeTruthy();
      expect(component.resultMessage).toBeNull();
      expect(component.loading).toBeFalsy();
    }));

    it('should handle failed results', fakeAsync(() => {
      // arrange

      // act
      component.handleClick();
      resolver(false);
      tick();

      // assert
      expect(component.result).toBeFalsy();
      expect(component.resultMessage).toBeNull();
      expect(component.loading).toBeFalsy();
    }));

    it('should handle failed message results', fakeAsync(() => {
      // arrange

      // act
      component.handleClick();
      resolver('test');
      tick();

      // assert
      expect(component.result).toBeFalsy();
      expect(component.resultMessage).toBe('test');
      expect(component.loading).toBeFalsy();
    }));
  });

  describe('ngOnInit', () => {
    it('should set hidden when scope is not set', inject([AuthService], (authService: AuthService) => {
      // arrange
      (authService.hasScope as jasmine.Spy).and.returnValue(false);
      component.actionOption = {
        scope: Scopes.AddFinanceBeneficiary
      } as any;

      // act
      component.ngOnInit();

      // assert
      expect(component.hidden).toBeTruthy();
      expect(authService.hasScope).toHaveBeenCalledWith(Scopes.AddFinanceBeneficiary);
    }));

    it('should set not hidden when scope is set', inject([AuthService], (authService: AuthService) => {
      // arrange
      (authService.hasScope as jasmine.Spy).and.returnValue(true);
      component.actionOption = {
        scope: Scopes.AddFinanceBeneficiary
      } as any;

      // act
      component.ngOnInit();

      // assert
      expect(component.hidden).toBeFalsy();
      expect(authService.hasScope).toHaveBeenCalledWith(Scopes.AddFinanceBeneficiary);
    }));

    it('should set not hidden when scope is null', inject([AuthService], (authService: AuthService) => {
      // arrange
      (authService.hasScope as jasmine.Spy).and.returnValue(true);
      component.actionOption = {

      } as any;

      // act
      component.ngOnInit();

      // assert
      expect(component.hidden).toBeFalsy();
    }));
  });
});
