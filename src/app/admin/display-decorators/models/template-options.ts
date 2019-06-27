import { FormlyTemplateOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { FormlyAttributeEvent } from '@ngx-formly/core/lib/components/formly.field.config';
import { TemplateManipulators } from '@ngx-formly/core/lib/services/formly.config';
import { DataFormats } from './data-formats.enum';

/**
 * @description Template options that determine how a field is displayed and how form fields gets rendered
 */
export class TemplateOptions implements FormlyTemplateOptions {
    labelProp?: string;
    valueProp?: string;
    type?: string;
    format?: DataFormats;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    options?: any[] | Observable<any[]>;
    rows?: number;
    cols?: number;
    description?: string;
    hidden?: boolean;
    max?: number;
    min?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string | RegExp;
    required?: boolean;
    tabindex?: number;
    attributes?: {
        [key: string]: string | number;
    };
    step?: number;
    focus?: FormlyAttributeEvent;
    blur?: FormlyAttributeEvent;
    keyup?: FormlyAttributeEvent;
    keydown?: FormlyAttributeEvent;
    click?: FormlyAttributeEvent;
    change?: FormlyAttributeEvent;
    keypress?: FormlyAttributeEvent;
    templateManipulators?: TemplateManipulators;
    [additionalProperties: string]: any;
}
