import { ApiModelBase } from '../../resources/bank-api/models/api-model-base';
import { DisplayDecorator } from '../decorators/display.decorator';
import { PropertyTypes } from '../models/export-models';
import { ModelHelper } from './model.helper';

describe('ModelHelper', () => {
    describe('GetDisplayProperties', () => {
        it('should get metadata set by decorators of nested classes', () => {
            // arrange
            class ChildClass extends ApiModelBase {
                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    templateOptions: {},
                })
                public childProp1 = '';
                public childProp2 = '';
            }

            class TestClass extends ApiModelBase {

                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    templateOptions: {}
                })
                public prop1 = '';

                @DisplayDecorator.Display({
                    type: PropertyTypes.class,
                    class: ChildClass,
                })
                public prop2 = new ChildClass();
            }

            const testClassInstance = new TestClass();

            // act
            const properties = ModelHelper.GetDisplayProperties(testClassInstance);

            // assert
            expect(properties).toEqual([
                {
                    type: PropertyTypes.input,
                    templateOptions: {},
                    path: 'prop1',
                },
                {
                    type: PropertyTypes.class,
                    path: 'prop2',
                    class: ChildClass,
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp1',
                        }
                    ]
                }
            ]);
        });

        it('should handle arrays', () => {
            // arrange
            class ChildClass extends ApiModelBase {
                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    templateOptions: {},
                })
                public childProp1 = '';
            }

            class TestClass extends ApiModelBase {

                @DisplayDecorator.Display({
                    type: PropertyTypes.array,
                    class: ChildClass
                })
                public prop1: Array<ChildClass>;

                @DisplayDecorator.Display({
                    type: PropertyTypes.array,
                    class: ChildClass
                })
                public prop2: ChildClass[];

                @DisplayDecorator.Display({
                    type: PropertyTypes.array,
                    class: ChildClass
                })
                public prop3: ChildClass[];

                @DisplayDecorator.Display({
                    type: PropertyTypes.array
                })
                public prop4: Array<number>;
            }

            const testClassInstance = new TestClass();
            const childClass = new ChildClass();
            childClass.childProp1 = 'test123';

            testClassInstance.prop1 = new Array();
            testClassInstance.prop1.push(childClass);
            testClassInstance.prop1.push(childClass);

            testClassInstance.prop2 = [childClass, childClass];

            testClassInstance.prop3 = new Array();

            testClassInstance.prop4 = [1, 2, 3];

            // act
            const properties = ModelHelper.GetDisplayProperties(testClassInstance);

            // assert
            expect(properties).toEqual([
                {
                    type: PropertyTypes.array,
                    path: 'prop1',
                    class: ChildClass,
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp1',
                        }
                    ]
                },
                {
                    type: PropertyTypes.array,
                    path: 'prop2',
                    class: ChildClass,
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp1',
                        }
                    ]
                },
                {
                    type: PropertyTypes.array,
                    class: ChildClass,
                    path: 'prop3',
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp1',
                        }
                    ]
                },
                {
                    type: PropertyTypes.array,
                    path: 'prop4'
                }
            ]);
        });

        it('should transverse nested optional objects', () => {
            // arrange
            class ChildClass extends ApiModelBase {
                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    templateOptions: {},
                })
                public childProp1 = '';
            }

            class TestClass extends ApiModelBase {

                @DisplayDecorator.Display({
                    type: PropertyTypes.array,
                    class: ChildClass
                })
                public prop1: Array<ChildClass> = null;

                @DisplayDecorator.Display({
                    type: PropertyTypes.class,
                    class: ChildClass
                })
                public prop2: ChildClass = null;

            }

            // act
            const properties = ModelHelper.GetDisplayProperties(new TestClass());

            // assert
            expect(properties).toEqual([
                {
                    type: PropertyTypes.array,
                    path: 'prop1',
                    class: ChildClass,
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp1',
                        }
                    ]
                },
                {
                    type: PropertyTypes.class,
                    path: 'prop2',
                    class: ChildClass,
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp1',
                        }
                    ]
                }
            ]);

        });

        it('should sort fields based on sort order', () => {
            // arrange
            class ChildClass extends ApiModelBase {
                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    templateOptions: {},
                })
                public childProp3 = '';

                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    order: 1,
                    templateOptions: {},
                })
                public childProp2 = '';

                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    order: 0,
                    templateOptions: {},
                })
                public childProp1 = '';
            }

            class TestClass extends ApiModelBase {

                @DisplayDecorator.Display({
                    type: PropertyTypes.input,
                    templateOptions: {}
                })
                public prop1 = '';

                @DisplayDecorator.Display({
                    type: PropertyTypes.class,
                    class: ChildClass,
                    order: 100
                })
                public prop2 = new ChildClass();
            }

            const testClassInstance = new TestClass();

            // act
            const properties = ModelHelper.GetDisplayProperties(testClassInstance);

            // assert
            expect(properties).toEqual([
                {
                    type: PropertyTypes.class,
                    path: 'prop2',
                    class: ChildClass,
                    order: 100,
                    childOptions: [
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            order: 0,
                            path: 'childProp1',
                        },
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            order: 1,
                            path: 'childProp2',
                        },
                        {
                            type: PropertyTypes.input,
                            templateOptions: {},
                            path: 'childProp3',
                        }
                    ]
                },
                {
                    type: PropertyTypes.input,
                    templateOptions: {},
                    path: 'prop1',
                }
            ]);
        });
    });

    describe('GetClassInstance', () => {
        class TestClass extends ApiModelBase {
            public constructedObject: any;
            fromServerObject(passedApiObject) {
                this.constructedObject = passedApiObject;
            }

        }
        let target;
        let apiObject;
        beforeEach(() => {
            target = {};
            apiObject = {
                test: 'value'
            };
        });
        it('should get a new instance of a class', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue({
                type: PropertyTypes.class,
                class: TestClass
            });

            // act
            const instance = ModelHelper.GetClassInstance<TestClass, TestClass>(target, 'test', apiObject);

            // assert
            expect(Reflect.getMetadata).toHaveBeenCalledWith(jasmine.any(Symbol), target, 'test');
            expect(instance instanceof TestClass).toBeTruthy();
            if (instance instanceof TestClass) {
                expect(instance.constructedObject).toBe('value');
            }
        });

        it('should return null when not class property', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue({
                type: PropertyTypes.input,
                class: TestClass
            });

            // act
            const instance = ModelHelper.GetClassInstance(target, 'test', apiObject);

            // assert
            expect(instance).toBeNull();
        });

        it('should return null when type not defined', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue({
            });

            // act
            const instance = ModelHelper.GetClassInstance(target, 'test', apiObject);

            // assert
            expect(instance).toBeNull();
        });

        it('should return null when properties not set on decorator', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue(null);

            // act
            const instance = ModelHelper.GetClassInstance(target, 'test', apiObject);

            // assert
            expect(instance).toBeNull();
        });

        it('should throw an exception when class in not set', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue({
                type: PropertyTypes.class
            });

            // act
            let error: Error;
            try {
                ModelHelper.GetClassInstance(target, 'test', apiObject);
            } catch (e) {
                error = e;
            }

            expect(error).not.toBeNull();
            expect(error.message).toBe('The class property has to be defined for classes');

        });

        it('should handle arrays', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue({
                type: PropertyTypes.array,
                class: TestClass
            });

            const arrayApiObject = {
                'test': [1, 2]
            };

            // act
            const instance = ModelHelper.GetClassInstance<TestClass, TestClass>(target, 'test', arrayApiObject as any as TestClass);

            // assert
            expect(Reflect.getMetadata).toHaveBeenCalledWith(jasmine.any(Symbol), target, 'test');
            expect(instance instanceof Array).toBeTruthy();
            if (instance instanceof Array) {
                expect(instance.length).toBe(2);
                expect(instance[0] instanceof TestClass).toBeTruthy();
                expect(instance[1] instanceof TestClass).toBeTruthy();
                if (instance[0] instanceof TestClass) {
                    expect(instance[0].constructedObject).toBe(1);
                }
                if (instance[1] instanceof TestClass) {
                    expect(instance[1].constructedObject).toBe(2);
                }

            }

        });

        it('should handle arrays with null value', () => {
            // arrange
            spyOn(Reflect, 'getMetadata').and.returnValue({
                type: PropertyTypes.array,
                class: TestClass
            });

            const arrayApiObject = {
                'test': null
            };

            // act
            const instance = ModelHelper.GetClassInstance<TestClass, TestClass>(target, 'test', arrayApiObject as any as TestClass);

            // assert
            expect(Reflect.getMetadata).toHaveBeenCalledWith(jasmine.any(Symbol), target, 'test');
            expect(instance instanceof Array).toBeTruthy();
            if (instance instanceof Array) {
                expect(instance.length).toBe(0);
            }

        });
    });
});
