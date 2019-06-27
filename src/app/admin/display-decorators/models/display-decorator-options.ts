import { PropertyTypes } from './property-types.enum';
import { ApiModelBase } from '../../resources/bank-api/models/api-model-base';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TemplateOptions } from './template-options';
import { FormlyLifeCycleOptions, FormlyHookFn } from '@ngx-formly/core/lib/components/formly.field.config';

/**
 * @description Options that can be set on display decorator
 * @see DisplayDecorator
 */
export class DisplayDecoratorOptions implements FormlyFieldConfig {
    /**
     * @description The property key
     */
    key?: string;

    /**
     * @description The type of property
     */
    type: PropertyTypes;

    /**
     * @description The type of value for select and searchSelect types
     */
    valueType?: string;

    /**
     * @description Display options
     */
    templateOptions?: TemplateOptions;

    /**
     * @description Initializer for class types
     */
    class?: (new () => ApiModelBase);

    /**
     * @description Max number value (used for validation)
     */
    max?: number;

    /**
     * @description Min number value (used for validation)
     */
    min?: number;

    /**
     * @description Min string length (used for validation)
     */
    minLength?: number;

    /**
     * @description Max string length (used for validation)
     */
    maxLength?: number;

    /**
     * @description Endpoint where valid values can be retrieved from
     */
    referenceDataApi?: string;

    /**
     * @description Type returned by the the reference data.
     */
    referenceDataReturnType?: new (any) => any;

    /**
     * @description Path to the data in the response of the reference api
     */
    referenceDataPath?: string;

    /**
     * @description Details about variables in the ref data path and where to get values for them
     */
    referenceDataPathVariables?: Array<{ name: string, pathInObject: string }>;

    /**
     * @description filter reference data before using it in a drop down
     */
    referenceDataFilter?: (item: any) => Boolean;

    /**
     * @description Async method to call for data
     */
    getDataMethod?: () => Promise<Array<any>>;

    /**
     * @description Order fields in form
     */
    order?: number;

    validators?: any;

    hooks?: FormlyLifeCycleOptions<FormlyHookFn>;

    className?: string;
}

