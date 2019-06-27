import { ApiFormBaseComponent } from '../api-form-base/api-form-base.component';
import { ApiModelBase, ServiceResponse } from '../../../resources/bank-api/bank-api.module';
import { FormPropertiesService } from '../../services/form-properties.service';
import { OnInit } from '@angular/core';

export class ApiEditFormBaseComponent<TRequest extends ApiModelBase, TResponse extends ApiModelBase>
  extends ApiFormBaseComponent<TRequest, TResponse>
  implements OnInit {

  /**
  * @description Getter for the current model that should be viewed. This should be overridden by
  * classes that extends this base class
  */
  public get modelId(): string {
    throw new Error('Not Implemented');
  }

  /**
   * @description Constructor
   * @param _formPropertiesService Dependency injected services
   */
  constructor(_formPropertiesService: FormPropertiesService) {
    super(_formPropertiesService);
  }

  /**
   * @description Angular component init. Call async initialization to make sure model is created before calling init
   * for base class
   */
  ngOnInit() {
    this.asyncOnOInit();
  }

  /**
   * @description Method to get edit model from server. Should be overridden by extending class
   * @param _modelId The ID of the item to get
   */
  public async loadModelFromServer(_modelId: string): Promise<ServiceResponse<TRequest>> {
    throw new Error('Not Implemented');
  }

  /**
   * @description reset the form so that it can be submitted again. This also includes calling
   * loadModelFromServerAgain
   */
  public reset() {
    super.reset();
    this.ngOnInit();
  }
  /**
   * @description Async initializer. Gets the edit object from the API and set values on the model. After the model
   * has been retrieved, call ngOnInit on the base class.
   */
  private async asyncOnOInit(): Promise<void> {
    this.loading = true;
    const serverResponse = await this.loadModelFromServer(this.modelId);

    if (serverResponse.success) {
      super.ngOnInit();
      this.model.fromServerObject<TRequest>(serverResponse.data);

    } else {
      this.error = serverResponse.error;
    }

    this.loading = false;
  }
}
