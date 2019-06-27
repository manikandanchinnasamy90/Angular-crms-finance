import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutModalComponent } from './logout-modal.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieManagementService } from 'src/app/cookie-management.service';
import { Router } from '@angular/router';

describe('LogoutModalComponent', () => {
  let component: LogoutModalComponent;
  let fixture: ComponentFixture<LogoutModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutModalComponent],
      providers: [
        {
          provide: NgbActiveModal,
          useValue: jasmine.createSpyObj(['test'])
        },
        {
          provide: CookieManagementService,
          useValue: jasmine.createSpyObj(['test'])
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj(['test'])
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
