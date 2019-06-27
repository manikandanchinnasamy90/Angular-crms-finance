import { OnInit } from '@angular/core';
import { ServiceResponse, ApiModelBase, BaseResponse } from '../../../resources/bank-api/bank-api.module';
import { FormPropertiesService, Validations, IActionOptions } from '../../display-helpers.module';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ModelHelper, DisplayOptions } from 'src/app/admin/display-decorators/display-decorators.module';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep } from 'lodash';

/**
* @description Base class that contains basic functionality for forms. Based on the model class a form is generated
* with the assistance of Formly.
*
* TRequest is the model of the request object sent to the API
* TResponse is the model of the expected results from the API form post
*
* @usageNotes
* You have to set the model property to an instance of the model TRequest.
* CallService method should be overridden. The title should also be set.
*/
export class ApiFormBaseComponent<TRequest extends ApiModelBase, TResponse extends ApiModelBase> implements OnInit {

  private modelBackup: TRequest;
  /**
   * @description Formly options. Populated from formly component. Used to reset form
   */
  public options: FormlyFormOptions = {};

  /**
   * @description The title of the page. Should be overridden
   */
  public title = 'Add new';

  /**
  * @description Optional custom text for the button to submit the form
  */
  public buttonText?: string = null;

  /**
   * @description The angular form
   */
  public form = new FormGroup({});

  /**
   * @description The formly fields used to render the form
   */
  public fields: FormlyFieldConfig[];

  /**
   * @description The model instance. Should be instantiated in the constructor
   */
  public get model(): TRequest {
    return this.wrappedModel.form;
  }
  public set model(value: TRequest) {
    this.wrappedModel.form = value;
  }

  /**
   * @description Options that determine if specific classes should include a action button
   */
  public actionOptions: IActionOptions[];

  /**
   * @description The model instance wrapped in an object to allow validation to run on multiple fields
   * This object is built automatically during initialization
   */
  public wrappedModel: { form: TRequest };

  /**
   * @description Custom and complex validation options that can be set in implementation class. Check formly
   * docs for details (https://formly-js.github.io/ngx-formly/examples/validation/matching-two-fields)
   */
  public additionalValidations?: Validations;

  public fieldOptionsOverrides?: Array<DisplayOptions>;

  /**
   * @description Indicate a loading state
   */
  public loading = false;

  /**
   * @description The server results
   */
  public responseResult: TResponse;

  /**
   * @description The error response from the server
   */
  public error: HttpErrorResponse;

  /**
   * @description The base response object expected when an error occurs
   */
  public errorObject: BaseResponse;

  /**
   * @description Constructor
   * @param formPropertiesService Dependency injected services
   */
  constructor(
    private formPropertiesService: FormPropertiesService) {
    this.wrappedModel = {
      form: null
    };
  }

  /**
   * @description Initialize form by loading formly properties through reflection
   */
  public ngOnInit() {
    // make sure all optional sub classes are instantiated
    if (this.model == null) {
      throw new Error('Model has to be instantiated before ngOnInit');
    }

    this.modelBackup = cloneDeep(this.model);
    this.model.fromServerObject(this.model);

    let properties = ModelHelper.GetDisplayProperties(this.model);
    properties = this.overrideDisplayOptions(properties, this.fieldOptionsOverrides);

    this.fields = this.formPropertiesService.displayToFormProperties(properties);

    const newFields: Array<FormlyFieldConfig> = [{
      key: 'form',
      validators: this.additionalValidations,
      fieldGroup: this.fields
    }];

    this.fields = newFields;
  }

  /**
   * @description Observe any changes to the model. Should be registered during or after OnInit
   */
  public get modelChanges(): Observable<TRequest> {
    return this.form.valueChanges.pipe(map(v => {
      return v.form;
    }));
  }

  scrollTo(el: Element) {
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToError(): void {
    const firstElementWithError = document.querySelector('.form-group.has-error');
    this.scrollTo(firstElementWithError);
  }
  /**
   * @description Method that is called when the form is submitted.
   */
  public async submit() {
    // don't submit the form if it is invalid
    if (this.form.invalid) {

      this.scrollToError();
      return;
    }

    // show loading indicator and clear possible error
    this.loading = true;
    this.error = null;
    this.errorObject = null;

    // call service as set up by implemented component class
    const requestResults = await this.callService();

    // handle results
    if (requestResults.success) {
      this.responseResult = requestResults.data;
    } else {
      this.error = requestResults.error;
      if (this.error != null && typeof this.error.error !== 'string') {
        this.errorObject = new BaseResponse();
        this.errorObject.fromServerObject(this.error.error);
      }
    }

    // clear loading message
    this.loading = false;
  }

  /**
   * @description Method that should be overridden by classes that extends this base class. This
   * method should post the model to the API
   */
  /* istanbul ignore next */
  public async callService(): Promise<ServiceResponse<TResponse>> {
    throw new Error('Not Implemented');
  }

  /**
   * @description reset the form so that it can be submitted again
   */
  public reset() {
    this.responseResult = null;
    this.error = null;

    this.errorObject = null;
  }

  public resetModel() {
    this.model = cloneDeep(this.modelBackup);
  }

  private overrideDisplayOptions(displayOptions: Array<DisplayOptions>, overrides: Array<DisplayOptions>) {
    if (overrides == null) {
      return displayOptions;
    }

    return displayOptions.map((option) => {
      const overriddenOption = overrides.find((override) => option.key === override.key);
      if (overriddenOption != null) {
        return overriddenOption;
      }

      return option;
    });
  }
}
