import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * @description Get validation messages used in formly forms
 */
export class ValidationMessageHelper {
    public static minLengthValidationMessage(_err: Error, field: FormlyFieldConfig) {
        return `Should have at least ${field.templateOptions.minLength} characters`;
    }

    public static maxLengthValidationMessage(_err: Error, field: FormlyFieldConfig) {
        return `This value should be less than ${field.templateOptions.maxLength} characters`;
    }

    public static minValidationMessage(_err: Error, field: FormlyFieldConfig) {
        return `This value should be more than ${field.templateOptions.min}`;
    }

    public static maxValidationMessage(_err: Error, field: FormlyFieldConfig) {
        return `This value should be less than ${field.templateOptions.max}`;
    }
}
