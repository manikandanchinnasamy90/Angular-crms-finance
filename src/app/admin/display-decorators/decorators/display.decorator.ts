import 'reflect-metadata';
import { DisplayDecoratorOptions } from '../models/display-decorator-options';
import { ModelHelper } from '../helpers/model.helper';

/**
 * @description Decorators used to affect the rendering of models in forms and views
 */
export class DisplayDecorator {
    /**
     * @description A decorator that is used to set display properties on the property metadata used during
     * reflection
     * @param options THe options that should be added to the field metadata
     */
    public static Display(options: DisplayDecoratorOptions) {
        return Reflect.metadata(ModelHelper.DisplayMetadataKey, options);
    }
}
