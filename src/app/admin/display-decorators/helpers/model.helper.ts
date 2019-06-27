import 'reflect-metadata';
import { DisplayOptions } from '../models/display-options';
import { PropertyTypes } from '../models/property-types.enum';
import { ApiModelBase } from '../../resources/bank-api/models/api-model-base';

/**
 * @description Helper class with static method used during reflection of API models
 */
export class ModelHelper {
    /**
     * @description The metadata key used to store display options
     */
    public static DisplayMetadataKey = Symbol('display');

    /**
     * @description Set properties on a target object from a server object keeping the display options in mind
     * @param TTarget The class of the target object
     * @param TApiSource The api model class
     * @param target Object where properties should be set
     * @param name the name of the property on the
     * @param apiObject the object returned from the API
     */
    public static GetClassInstance<TTarget extends ApiModelBase, TApiSource>
        (target: TTarget, name: keyof TApiSource | string, apiObject: TApiSource)
        : TTarget | Array<TTarget> {

        // get the display properties
        const properties = Reflect.getMetadata(ModelHelper.DisplayMetadataKey, target, name as string) as DisplayOptions;
        if (properties == null ||
            properties.type == null ||
            (properties.type !== PropertyTypes.class && properties.type !== PropertyTypes.array) ||
            properties.type === PropertyTypes.array && properties.class == null) {
            return null;
        }

        // for a class create a new instance of the object and set the properties
        if (properties.type === PropertyTypes.class) {
            if (properties.class == null) {
                throw new Error('The class property has to be defined for classes');
            }

            const newInstance = new properties.class();
            newInstance.fromServerObject<TTarget>(apiObject[name as string]);

            return newInstance as TTarget;
        }

        // now we know type is array, create instances for each element
        // if (properties.type === PropertyTypes.array)
        const array: Array<any> = apiObject[name as string];
        const returnArray = new Array<TTarget>();

        if (array != null) {
            array.forEach(element => {
                const newInstance = new properties.class();
                newInstance.fromServerObject(element);
                returnArray.push(newInstance as TTarget);
            });
        }

        return returnArray;
    }

    /**
     * Recursively get the display properties for a given class
     * @param target The object to get display properties for
     */
    public static GetDisplayProperties(target: ApiModelBase): Array<DisplayOptions> {
        const properties: Array<DisplayOptions> = [];
        Object.getOwnPropertyNames(target).forEach((name) => {

            const options = Reflect.getMetadata(ModelHelper.DisplayMetadataKey, target, name) as DisplayOptions;

            if (options != null) {
                options.path = name;
                if (options.type === PropertyTypes.class
                    || (options.type === PropertyTypes.array && options.class != null)
                    || (options.type === PropertyTypes.arrayTable && options.class != null)) {

                    const childProperties = ModelHelper.GetDisplayProperties(new options.class());
                    options.childOptions = childProperties;
                    properties.push(options);
                } else {
                    properties.push(options);
                }
            }
        });

        properties.sort((a, b) => a.order == null ? 1 : b.order == null ? -1 : a.order - b.order);
        return properties;
    }
}
