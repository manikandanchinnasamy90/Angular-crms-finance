import { ApiModelBase } from './api-model-base';
import { ModelHelper, PropertyTypes } from 'src/app/admin/display-decorators/display-decorators.module';

describe('ApiModelBase', () => {
    describe('fromServerObject', () => {
        class TestClass extends ApiModelBase {
            a: string = null;
            b: number = null;
        }

        beforeEach(() => {
            spyOn(Reflect, 'getMetadata').and.returnValue(null);
        });

        it('should set properties on new instance', () => {
            // arrange
            const testObject = {
                a: '1',
                b: 2
            } as any as ApiModelBase;

            spyOn(ModelHelper, 'GetClassInstance').and.returnValue(null);

            // act
            const element = new TestClass();
            element.fromServerObject(testObject);

            // assert
            expect(element instanceof TestClass).toBeTruthy();
            expect(element['a']).toBe('1');
            expect(element['b']).toBe(2);
        });

        it('should respect value type properties', () => {
            // arrange
            const testObject = {
                a: 1,
                b: '2'
            } as any as ApiModelBase;

            spyOn(ModelHelper, 'GetClassInstance').and.returnValue(null);

            (Reflect.getMetadata as jasmine.Spy).and.callFake(
                (_metadataKey: any, _target: Object, propertyKey: string | symbol) => {
                    if (propertyKey === 'a') {
                        return {
                            valueType: typeof ''
                        };
                    }

                    if (propertyKey === 'b') {
                        return {
                            valueType: typeof 0
                        };
                    }
                });

            // act
            const element = new TestClass();
            element.fromServerObject(testObject);

            // assert
            expect(element instanceof TestClass).toBeTruthy();
            expect(element['a']).toBe('1');
            expect(element['b']).toBe(2);
        });

        it('should keep null values intact', () => {
            // arrange
            const testObject = {
                a: null,
                b: null
            } as any as ApiModelBase;

            spyOn(ModelHelper, 'GetClassInstance').and.returnValue(null);

            (Reflect.getMetadata as jasmine.Spy).and.callFake(
                (_metadataKey: any, _target: Object, propertyKey: string | symbol) => {
                    if (propertyKey === 'a') {
                        return {
                            valueType: typeof ''
                        };
                    }

                    if (propertyKey === 'b') {
                        return {
                            valueType: typeof 0
                        };
                    }
                });

            // act
            const element = new TestClass();
            element.fromServerObject(testObject);

            // assert
            expect(element instanceof TestClass).toBeTruthy();
            expect(element['a']).toBeNull();
            expect(element['b']).toBeNull();
        });


        it('should create assign new instance of classes from DisplayDecorator', () => {
            // arrange
            const testObject = {
                a: null
            } as any as ApiModelBase;

            const testClassInstance = {};

            spyOn(ModelHelper, 'GetClassInstance').and.returnValue(testClassInstance);

            // act
            const element = new TestClass();
            element.fromServerObject(testObject);

            // assert
            expect(element instanceof TestClass).toBeTruthy();
            expect(element['a'] as any).toBe(testClassInstance);
            expect(ModelHelper.GetClassInstance).toHaveBeenCalledWith(element, 'a', testObject);
        });

        it('should not throw exceptions when apiObject is null', () => {
            // arrange

            // act
            const element = new TestClass();
            element.fromServerObject(undefined);
            const element2 = new TestClass();
            element.fromServerObject(null);

            // assert
            expect(element instanceof TestClass).toBeTruthy();
            expect(element2 instanceof TestClass).toBeTruthy();
        });

        it('should handle arrays of basic types', () => {
            // arrange
            const testObject = {
                a: [1, 2, 3],
            } as any as ApiModelBase;

            spyOn(ModelHelper, 'GetClassInstance').and.returnValue(null);

            // act
            const element = new TestClass();
            element.fromServerObject(testObject);

            // assert
            expect(element instanceof TestClass).toBeTruthy();
            expect(element['a'] as any).toEqual([1, 2, 3]);
        });
    });


    describe('toServerObject', () => {
        it('should clear unused optional properties', () => {
            // arrange
            class TestClass extends ApiModelBase {
                // required value
                public id: number;

                // required by with null
                public value: number;

                // not required empty string
                public a?: string;

                // not required null
                public b?: number;

                // not required null array
                public c?: Array<string>;

                // not required whitespace string
                public d: string;
            }

            const test = new TestClass();
            test.id = 123;
            test.value = null;
            test.a = '';
            test.b = null;
            test.c = null;
            test.d = '   ';

            spyOn(ModelHelper, 'GetDisplayProperties').and.returnValue([
                {
                    path: 'id', templateOptions: {
                        required: true
                    }
                },
                {
                    path: 'value', templateOptions: {
                        required: true
                    }
                },
                {
                    path: 'a', templateOptions: {
                        required: false
                    }
                },
                {
                    path: 'b'
                },
                {
                    path: 'c', templateOptions: {
                        required: false
                    }
                },
                {
                    path: 'd', templateOptions: {
                        required: false
                    }
                },
            ]);

            // act
            const result = test.toServerObject();

            // assert
            expect(result).toEqual({ id: 123, value: null, b: null });
        });

        it('should clear whole classes if empty', () => {
            // arrange
            class ParentClass extends ApiModelBase {
                // required property
                public id: number;

                /// not required empty class
                public c?: ChildClass;

                /// not required non empty class
                public cNotEmpty?: ChildClass;

                // required empty class
                public c2: ChildClass;

                // required empty class without template options
                public c3: ChildClass;

                /// not required without instance
                public c4?: ChildClass;
            }

            class ChildClass extends ApiModelBase {
                public value?: number;
            }

            const test = new ParentClass();
            test.id = 123;

            const child = new ChildClass();
            const child2 = new ChildClass();
            const child3 = new ChildClass();
            const childNotEmpty = new ChildClass();
            child.value = null;
            child2.value = null;
            child3.value = null;
            childNotEmpty.value = 123;
            test.c = child;
            test.c2 = child2;
            test.c3 = child3;
            test.c4 = null;
            test.cNotEmpty = childNotEmpty;

            spyOn(ModelHelper, 'GetDisplayProperties').and.callFake((instance) => {
                if (instance instanceof ParentClass) {
                    return [
                        {
                            path: 'id', templateOptions: {
                                required: true
                            }
                        },
                        {
                            path: 'c',
                            type: PropertyTypes.class,
                            templateOptions: {
                                required: false
                            }
                        },
                        {
                            path: 'c2',
                            type: PropertyTypes.class,
                            templateOptions: {
                                required: true
                            }
                        },
                        {
                            path: 'c3',
                            type: PropertyTypes.class,
                        },
                        {
                            path: 'c4',
                            type: PropertyTypes.class,
                            templateOptions: {
                                required: false
                            }
                        },
                        {
                            path: 'cNotEmpty',
                            type: PropertyTypes.class,
                            templateOptions: {
                                required: false
                            }
                        },
                    ];
                } else {
                    return [
                        {
                            path: 'value', templateOptions: {
                                required: false
                            }
                        }
                    ];
                }

            });

            // act
            const result = test.toServerObject();

            // assert
            expect(result).toEqual(
                {
                    id: 123,
                    c2: {},
                    c3: {},
                    cNotEmpty: {
                        value: 123
                    }
                });
        });

        it('should respect the template option type', () => {
            // arrange
            class ParentClass extends ApiModelBase {
                // required property
                public id: number;
                public c: ChildClass;
            }

            class ChildClass extends ApiModelBase {
                public valueNumber: string;
                public valueString: number;
                public valueOther: any;
            }

            const test = new ParentClass();
            test.id = 123;

            const child = new ChildClass();
            child.valueString = 123;
            child.valueNumber = '123';
            child.valueOther = 'xxx';
            test.c = child;

            spyOn(ModelHelper, 'GetDisplayProperties').and.callFake((instance) => {
                if (instance instanceof ParentClass) {
                    return [
                        {
                            path: 'id', templateOptions: {
                                required: true
                            }
                        },
                        {
                            path: 'c',
                            type: PropertyTypes.class,
                            templateOptions: {
                                required: true
                            }
                        }
                    ];
                } else {
                    return [
                        {
                            path: 'valueString',
                            type: PropertyTypes.input,
                            valueType: typeof (''),
                            templateOptions: {
                                required: true
                            },
                        },
                        {
                            path: 'valueNumber',
                            type: PropertyTypes.input,
                            valueType: typeof (0),
                            templateOptions: {
                                required: true
                            },
                        },
                        {
                            path: 'valueOther',
                            type: PropertyTypes.input,
                            templateOptions: {
                                required: true
                            },
                        }
                    ];
                }

            });

            // act
            const result = test.toServerObject();

            // assert
            expect(result.c.valueString).toEqual('123');
            expect(result.c.valueNumber).toEqual(123);
            expect(result.c.valueOther).toEqual('xxx');
        });

        it('should recursively go through arrays', () => {
            class TestClassChild extends ApiModelBase {
                public value: number = null;
            }
            class TestClass extends ApiModelBase {
                public array: Array<TestClassChild> = null;
                public arrayTable: Array<TestClassChild> = null;
            }

            const test = new TestClass();

            const item1 = new TestClassChild();
            item1.value = 1;
            const item2 = new TestClassChild();

            const item3 = new TestClassChild();
            item3.value = '1' as any;
            const item4 = new TestClassChild();

            test.array = [item1, item2];
            test.arrayTable = [item3, item4];

            spyOn(ModelHelper, 'GetDisplayProperties').and.callFake((object: TestClass | TestClassChild) => {
                if (object instanceof TestClass) {
                    return [
                        {
                            path: 'array',
                            type: PropertyTypes.array,
                        },
                        {
                            path: 'arrayTable',
                            type: PropertyTypes.arrayTable,
                        }
                    ];
                }

                return [
                    {
                        path: 'value',
                        type: PropertyTypes.input,
                        valueType: typeof (0),
                        templateOptions: {
                            required: false
                        },
                    },
                ];

            });

            // act
            const result = test.toServerObject();

            // assert
            expect(result).toEqual({ array: [{ value: 1 }], arrayTable: [{ value: 1 }] });
        });
    });

});
