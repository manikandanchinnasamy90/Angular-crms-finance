import { DisplayDecoratorOptions } from './display-decorator-options';

/**
 * @description Extension of decorator options that include values used during processing of classes
 */
export class DisplayOptions extends DisplayDecoratorOptions {
    /**
     * @description Display options for class field types
     */
    childOptions?: Array<DisplayOptions>;

    /**
     * @description Path of field on object
     */
    path: string;
}
