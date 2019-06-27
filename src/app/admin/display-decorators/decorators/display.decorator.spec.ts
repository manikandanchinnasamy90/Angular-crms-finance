import { DisplayDecorator } from './display.decorator';
import { DisplayDecoratorOptions } from '../models/export-models';
import { ModelHelper } from '../helpers/model.helper';

describe('DisplayDecorator', () => {
    describe('Display', () => {
        it('should set the metaData', () => {
            // arrange
            const options = new DisplayDecoratorOptions();
            spyOn(Reflect, 'metadata').and.returnValue('test');

            // act
            const result = DisplayDecorator.Display(options);

            // assert
            expect(result).toBe('test');
            expect(Reflect.metadata).toHaveBeenCalledWith(ModelHelper.DisplayMetadataKey, options);
        });
    });

});
