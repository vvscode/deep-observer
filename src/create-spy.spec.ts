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
        nestedMethod: (a: number, b: number) => a * b,
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
    spyObject.prop2.nestedMethod(2, 3);

    // Check if history.put is called with the correct arguments
    expect(spyHistoryMock.put.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "key": "prop1",
            "type": "get",
          },
        ],
        [
          {
            "key": "prop2",
            "type": "get",
          },
        ],
        [
          {
            "key": "prop2.nestedProp1",
            "type": "get",
          },
        ],
        [
          {
            "key": "prop1",
            "type": "set",
            "value": 100,
          },
        ],
        [
          {
            "key": "method",
            "type": "get",
          },
        ],
        [
          {
            "args": [
              2,
              3,
            ],
            "key": "method",
            "type": "call",
          },
        ],
        [
          {
            "key": "prop2",
            "type": "get",
          },
        ],
        [
          {
            "key": "prop2.nestedMethod",
            "type": "get",
          },
        ],
        [
          {
            "args": [
              2,
              3,
            ],
            "key": "prop2.nestedMethod",
            "type": "call",
          },
        ],
      ]
    `);
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
    expect(spyHistoryMock.put.mock.calls).toMatchInlineSnapshot(`
      [
        [
          {
            "key": "a",
            "type": "get",
          },
        ],
        [
          {
            "key": "a.x",
            "type": "set",
            "value": 1,
          },
        ],
        [
          {
            "key": "a",
            "type": "get",
          },
        ],
        [
          {
            "key": "a.x",
            "type": "set",
            "value": 2,
          },
        ],
        [
          {
            "key": "b",
            "type": "get",
          },
        ],
        [
          {
            "key": "b.x",
            "type": "get",
          },
        ],
      ]
    `);
  });

  it('throws an error on calling with non-object', () => {
    expect(() => {
      createSpy(2, spyHistoryMock);
    }).toThrow();
  });

  describe('with throwing object', () => {
    let throwingObject: {
      method: (data: unknown) => void;
      property: number;
    };
    beforeEach(() => {
      throwingObject = createSpy(
        new Proxy(
          {
            method: () => {
              throw new Error("Object's method is not callable");
            },
            property: 21,
          },
          {
            get: function (_, key) {
              throw new Error(`Property '${String(key)}' does not exist on the object`);
            },
            set: function (_, key) {
              throw new Error(`Cannot set property '${String(key)}' on the object`);
            },
            apply: function () {
              throw new Error(`Object is not callable`);
            },
          },
        ),
        spyHistoryMock,
      );
    });
    it('should log property access to history', () => {
      expect(() => {
        throwingObject.property;
      }).toThrow();

      expect(spyHistoryMock.put.mock.calls).toMatchInlineSnapshot(`
        [
          [
            {
              "key": "property",
              "type": "get",
            },
          ],
        ]
      `);
    });

    it('should log property set to history', () => {
      expect(() => {
        throwingObject.property = 42;
      }).toThrow();

      expect(spyHistoryMock.put.mock.calls).toMatchInlineSnapshot(`
        [
          [
            {
              "key": "property",
              "type": "set",
              "value": 42,
            },
          ],
        ]
      `);
    });

    it('should log method call to history', () => {
      throwingObject = createSpy(
        {
          method: () => {
            throw new Error("Object's method is not callable");
          },
          property: 21,
        },
        spyHistoryMock,
      );

      expect(() => {
        throwingObject.method({ x: 1 });
      }).toThrow();

      expect(spyHistoryMock.put.mock.calls).toMatchInlineSnapshot(`
        [
          [
            {
              "key": "method",
              "type": "get",
            },
          ],
          [
            {
              "args": [
                {
                  "x": 1,
                },
              ],
              "key": "method",
              "type": "call",
            },
          ],
        ]
      `);
    });
  });
});
