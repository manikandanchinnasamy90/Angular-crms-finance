import { ValidationMessageHelper } from './validation-messages.helper';

describe('ValidationMessageHelper', () => {
    it('should provide a message for min length', () => {
        // act
        const message = ValidationMessageHelper.minLengthValidationMessage(new Error(), { templateOptions: { minLength: 10 } });

        // assert
        expect(message).toBe('Should have at least 10 characters');
    });

    it('should provide a message for max length', () => {
        // act
        const message = ValidationMessageHelper.maxLengthValidationMessage(new Error(), {
            templateOptions: {
                maxLength
                    : 10
            }
        });

        // assert
        expect(message).toBe('This value should be less than 10 characters');
    });

    it('should provide a message for min value', () => {
        // act
        const message = ValidationMessageHelper.minValidationMessage(new Error(), { templateOptions: { min: 10 } });

        // assert
        expect(message).toBe('This value should be more than 10');
    });

    it('should provide a message for max value', () => {
        // act
        const message = ValidationMessageHelper.maxValidationMessage(new Error(), { templateOptions: { max: 10 } });

        // assert
        expect(message).toBe('This value should be less than 10');
    });
});
