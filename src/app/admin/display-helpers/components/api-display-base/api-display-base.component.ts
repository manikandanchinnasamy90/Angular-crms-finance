import { OnInit } from '@angular/core';
import { ServiceResponse, ApiModelBase, BaseResponse } from '../../../resources/bank-api/bank-api.module';
import { Router, ActivatedRoute } from '@angular/router';
import { IActionOptions } from '../../models/export-models';

/**
* @description Base class that contains basic functionality for the display of object. Based on the
* model class a view is generated with the assistance.
*
* TModel is the model of the object that should be viewed
*
* @usageNotes
* callService method should be overridden to load data from the server.
* modelId getter should be overridden to get the current model ID.
*/
export class ApiDisplayBaseComponent<TModel extends ApiModelBase> implements OnInit {

  /**
   * @description The data that should be displayed
   */
  public data: TModel;

  /**
   * @description If an error is produced by the API it will be set in this property
   */
  public errorMessage: string;

  /**
   * @description The base response object expected when an error occurs
   */
  public errorObject: BaseResponse;

  /**
   * @description Title of the page. This should be overridden by the component that implements this base class
   */
  public title = 'View model';

  /**
   * @description An optional message to display on the top of the page
   */
  public informationMessage = null;

  /**
   * @description Getter for the options that determine if specific classes should include an action button. This
   * should be overridden by the extension class. If not overridden will return an empty array by default.
   */
  public get actionOptions(): IActionOptions[] {
    return [];
  }

  /**
  * @description Getter for the current model that should be viewed. This should be overridden by
  * classes that extends this base class
  */
  public get modelId(): string {
    throw new Error('Not Implemented');
  }

  /**
  * @description Getter for the URL to edit the current model being viewed. This should be overridden by
  * classes that extends this base class. If there is not an edit view, return null.
  */
  public get editUrl(): any[] {
    return null;
  }

  /**
   * @description Constructor
   * @param router Dependency injected services
   * @param activatedRoute Dependency injected services
   */
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {

  }

  /**
   * @description Initializes the component.
   *
   * Call the api service to load data. Assumes the service responds with a object matching
   * the Service Response
   */
  async ngOnInit() {
    const serverData = await this.callService(this.modelId);

    if (serverData.success) {
      this.data = serverData.data;
    } else {
      this.errorMessage = serverData.error.message;
      if (serverData.error != null && typeof serverData.error.error !== 'string') {
        this.errorObject = new BaseResponse();
        this.errorObject.fromServerObject(serverData.error.error);
      }
    }
  }

  /**
   * @description Method that should be overridden by classes that extends this base class
   *
   * @param _modelId a string of the current modelId that should be displayed
   */
  public async callService(_modelId: string): Promise<ServiceResponse<TModel>> {
    throw new Error('Not Implemented');
  }

  /**
   * @description Navigate to the edit view as defined by editUrl getter
   * @see editUrl
   */
  public navigateToEdit() {
    this.router.navigate(this.editUrl, { relativeTo: this.activatedRoute });
  }

  /**
  * @description Refresh the current model being displayed
  */
  public refresh() {
    this.errorMessage = null;
    this.errorObject = null;
    this.data = null;
    this.ngOnInit();
  }
}
