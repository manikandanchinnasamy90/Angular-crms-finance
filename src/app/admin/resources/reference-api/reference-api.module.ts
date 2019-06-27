import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @description Services and models used in the reference data API
 */
@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
  ],
  declarations: []
})
export class ReferenceApiModule { }

export * from './models/api-models/exports';
