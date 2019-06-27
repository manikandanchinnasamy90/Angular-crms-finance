import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Scopes } from 'src/app/scopes.enum';

@Directive({
  selector: '[appHideRouteWithScope]'
})
export class HideRouteWithScopeDirective implements OnInit {
  @Input()
  appHideRouteWithScope: string;

  constructor(private el: ElementRef, private authService: AuthService) {
  }

  ngOnInit(): void {
    const scopes = this.appHideRouteWithScope.split(',');
    if (scopes.every((v) => !this.authService.hasScope(v.trim() as Scopes))) {
      this.el.nativeElement.style.display = 'none';
    }
  }

}
