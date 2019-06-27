import { HideRouteWithScopeDirective } from './hide-route-with-scope.directive';
import { ElementRef } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

describe('HideRouteWithScopeDirective', () => {
  let element: ElementRef;
  let authServiceMock: AuthService;
  let directive: HideRouteWithScopeDirective;
  beforeEach(() => {
    element = {
      nativeElement: {
        style: {
          display: 'default'
        }
      }
    };

    authServiceMock = jasmine.createSpyObj(['hasScope']);

    directive = new HideRouteWithScopeDirective(element, authServiceMock);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should set style when scope is not set', () => {
    directive.appHideRouteWithScope = 'match';
    // arrange
    (authServiceMock.hasScope as jasmine.Spy).and.returnValue(false);

    // act
    directive.ngOnInit();

    // assert
    expect(element.nativeElement.style.display).toBe('none');
    expect(authServiceMock.hasScope).toHaveBeenCalledWith('match');
  });

  it('should not set style when scope is set', () => {
    directive.appHideRouteWithScope = 'other';
    // arrange
    (authServiceMock.hasScope as jasmine.Spy).and.returnValue(true);

    // act
    directive.ngOnInit();

    // assert
    expect(element.nativeElement.style.display).toBe('default');
    expect(authServiceMock.hasScope).toHaveBeenCalledWith('other');
  });

  it('should set style when none of the scopes are not set', () => {
    // arrange
    directive.appHideRouteWithScope = 'none, text, also';
    (authServiceMock.hasScope as jasmine.Spy).and.returnValue(false);

    // act
    directive.ngOnInit();

    // assert
    expect(element.nativeElement.style.display).toBe('none');
    expect(authServiceMock.hasScope).toHaveBeenCalledWith('none');
    expect(authServiceMock.hasScope).toHaveBeenCalledWith('text');
    expect(authServiceMock.hasScope).toHaveBeenCalledWith('also');
  });

  it('should not set style when one scope is set', () => {
    // arrange
    directive.appHideRouteWithScope = 'none, match, also';
    (authServiceMock.hasScope as jasmine.Spy).and.callFake((v: string) => v === 'match');

    // act
    directive.ngOnInit();

    // assert
    expect(element.nativeElement.style.display).toBe('default');
  });
});
