import { createSpy } from './create-spy';

describe('createSpy', () => {
  it('should create a spy object with history', () => {
    const originalObject = {
      prop1: 42,
      prop2: {
        nestedProp1: 'hello',
        nestedProp2: [1, 2, 3],
      },
      method: (a: number, b: number) => a + b,
    };

    const spyHistoryMock = {
      put: jest.fn(),
      getAll: jest.fn(),
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

    const spyHistoryMock = {
      put: jest.fn(),
      getAll: jest.fn(),
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

    const spyHistoryMock = {
      put: jest.fn(),
      getAll: jest.fn(),
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
});
