import { Component } from '@angular/core';

@Component({
    template: `
  <div class="d-flex">
    <side-bar></side-bar>
    <div class="flex-fill position-relative" style="overflow: auto">
        <navbar></navbar>
        <div class="container-fluid position-absolute pt-3">
            <router-outlet ></router-outlet>
      </div>
  </div>
</div>`
})
export class AdminComponent {
}
