import { createSpy } from './create-spy';
import { History } from './types';

describe('createSpy', () => {
  let spyHistoryMock: jest.Mocked<History>;

  beforeEach(() => {
    spyHistoryMock = {
      put: jest.fn(),
      getAll: jest.fn(),
    };
  });
  it('should create a spy object with history', () => {
    const originalObject = {
      prop1: 42,
      prop2: {
        nestedProp1: 'hello',
        nestedProp2: [1, 2, 3],
      },
      method: (a: number, b: number) => a + b,
    };

    const spyObject = createSpy(originalObject, spyHistoryMock);

    // Access properties
    spyObject.prop1;
    spyObject.prop2.nestedProp1;

    // Modify properties
    spyObject.prop1 = 100;

    // Call methods
    spyObject.method(2, 3);

    // Check if history.put is called with the correct arguments
    expect(spyHistoryMock.put).toHaveBeenCalledTimes(6);
    expect(spyHistoryMock.put.mock.calls).toEqual([
      ['prop1', { type: 'get', key: 'prop1' }],
      ['prop2', { type: 'get', key: 'prop2' }],
      ['prop2.nestedProp1', { type: 'get', key: 'nestedProp1' }],
      ['prop1', { type: 'set', key: 'prop1', value: 100 }],
      ['method', { type: 'get', key: 'method' }],
      [
        'method',
        {
          args: [2, 3],
          key: 'method',
          type: 'call',
        },
      ],
    ]);
  });

  it('should reuse proxy for the same target', () => {
    const originalObject = {
      prop1: 42,
    };

    const spyObject1 = createSpy(originalObject, spyHistoryMock);
    const spyObject2 = createSpy(originalObject, spyHistoryMock);

    // Ensure that proxy is reused for the same target
    expect(spyObject1).toEqual(spyObject2);
  });

  it('should reuse proxy for the same target / path', () => {
    const basicObject = {
      x: 1,
    };
    const complexObject = {
      a: basicObject,
      b: basicObject,
    };

    const spyObject = createSpy(complexObject, spyHistoryMock);
    spyObject.a.x = 1;
    spyObject.a.x = 2;
    spyObject.b.x;

    // Ensure that proxy is reused for the same target
    expect(spyHistoryMock.put.mock.calls).toEqual([
      ['a', { key: 'a', type: 'get' }],
      ['a.x', { key: 'x', type: 'set', value: 1 }],
      ['a', { key: 'a', type: 'get' }],
      ['a.x', { key: 'x', type: 'set', value: 2 }],
      ['b', { key: 'b', type: 'get' }],
      ['b.x', { key: 'x', type: 'get' }],
    ]);
  });

  describe('with throwing object', () => {
    let throwingObject: any;
    beforeEach(() => {
      throwingObject = createSpy(
        new Proxy(
          {
            method: () => {
              throw new Error("Object's method is not callable");
            },
          },
          {
            get: function (target, key) {
              throw new Error(`Property '${String(key)}' does not exist on the object`);
            },
            set: function (target, key, value) {
              throw new Error(`Cannot set property '${String(key)}' on the object`);
            },
            apply: function (target, thisArg, args) {
              throw new Error(`Object is not callable`);
            },
          }
        ),
        spyHistoryMock
      );
    });
    it('should log property access to history', () => {
      expect(() => {
        throwingObject.property;
      }).toThrow();

      expect(spyHistoryMock.put.mock.calls).toEqual([
        ['property', { key: 'property', type: 'get' }],
      ]);
    });

    it('should log property set to history', () => {
      expect(() => {
        throwingObject.property = 42;
      }).toThrow();

      expect(spyHistoryMock.put.mock.calls).toEqual([
        ['property', { key: 'property', type: 'set', value: 42 }],
      ]);
    });

    it('should log method call to history', () => {
      throwingObject = createSpy(
        {
          method: () => {
            throw new Error("Object's method is not callable");
          },
        },
        spyHistoryMock
      );

      expect(() => {
        throwingObject.method({ x: 1 });
      }).toThrow();

      expect(spyHistoryMock.put.mock.calls).toEqual([
        ['method', { key: 'method', type: 'get' }],
        [
          'method',
          {
            args: [{ x: 1 }],
            key: 'method',
            type: 'call',
          },
        ],
      ]);
    });
  });
});
