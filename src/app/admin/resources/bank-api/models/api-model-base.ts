import { ModelHelper, PropertyTypes, DisplayOptions } from 'src/app/admin/display-decorators/display-decorators.module';

/**
 * @description Base class for all API Models
 */
export class ApiModelBase {
    /**
     * @description Read properties from the API object and set properties on the model. Also includes
     * setting default values to all properties to ensure reflection works when displaying
     * model or creating a form.
     *
     * @param apiObject The object returned from the API
     */
    fromServerObject<T extends ApiModelBase>(apiObject: T) {
        if (apiObject != null) {
            Object.getOwnPropertyNames(this).forEach((key) => {
                const newClass = ModelHelper.GetClassInstance(this, key, apiObject);
                if (newClass != null) {
                    this[key] = newClass;
                } else {
                    const properties = Reflect.getMetadata(ModelHelper.DisplayMetadataKey, this, key) as DisplayOptions;
                    if (apiObject[key] == null ||
                        properties == null ||
                        (
                            properties.valueType !== typeof (0) &&
                            properties.valueType !== typeof ('')
                        )) {
                        this[key] = apiObject[key];
                    } else if (properties.valueType === typeof (0)) {
                        this[key] = Number(apiObject[key]);
                    } else {
                        this[key] = String(apiObject[key]);
                    }
                }
            });
        }
    }

    /**
     * @description Creates a new object from a API model
     * @returns a new object without any methods and with un-required properties with empty values removed.
     */
    toServerObject(): any {
        const properties = ModelHelper.GetDisplayProperties(this);
        const returnObject = {};

        let allPropertiesIsEmpty = true;
        properties.forEach((property) => {
            // clear classes
            if (property.type === PropertyTypes.class) {
                const childObject = this[property.path] == null ? undefined : (this[property.path] as ApiModelBase).toServerObject();

                if (childObject === undefined) {
                    if (property.templateOptions != null && !property.templateOptions.required) {
                        return;
                    } else {
                        returnObject[property.path] = {};
                    }
                    return;
                }

                returnObject[property.path] = childObject;
                return;
            }

            if (property.type === PropertyTypes.array || property.type === PropertyTypes.arrayTable) {
                // get server object for each item in array
                const returnArray = [];
                this[property.path].forEach((item: ApiModelBase) => {
                    const serverSaveListItem = item.toServerObject();
                    if (serverSaveListItem != null) {
                        allPropertiesIsEmpty = false;
                        returnArray.push(serverSaveListItem);
                    }
                });

                returnObject[property.path] = returnArray;
                return;
            }

            const value = this.castObjectToCorrectType(this[property.path], property.valueType);

            if (property.templateOptions == null || property.templateOptions.required) {
                allPropertiesIsEmpty = false;
                returnObject[property.path] = value;
                return;
            }

            //  clear not required fields with null or empty strings
            if (value === null ||
                typeof value === 'string' && value.trim() === '') {
                return;
            }

            allPropertiesIsEmpty = false;
            returnObject[property.path] = value;
        });

        if (allPropertiesIsEmpty) {
            return undefined;
        }

        return returnObject;
    }

    private castObjectToCorrectType(value: any, type: string) {
        if (value == null) {
            return value;
        }

        if (type === typeof ('')) {
            return String(value);
        } else if (type === typeof (0)) {
            return Number(value);
        }

        return value;
    }
}
