import { BasicHistory, createSpy } from './deep-observer';

describe('createSpy and BasicHistory Integration Tests', () => {
  it('should create a spy and record history for different methods', () => {
    const obj = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      method1: (x: unknown) => 'result1',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      method2: (y: unknown) => 'result2',
      method3: () => 'result3',
    };

    const history = new BasicHistory();
    const spiedObj = createSpy(obj, history);

    expect(spiedObj.method1(1)).toEqual('result1');
    expect(spiedObj.method2({ b: [] })).toEqual('result2');
    expect(spiedObj.method3()).toEqual('result3');

    expect(history.getAll()).toMatchInlineSnapshot(`
      [
        {
          "key": "method1",
          "type": "get",
        },
        {
          "args": [
            1,
          ],
          "key": "method1",
          "type": "call",
        },
        {
          "key": "method2",
          "type": "get",
        },
        {
          "args": [
            {
              "b": [],
            },
          ],
          "key": "method2",
          "type": "call",
        },
        {
          "key": "method3",
          "type": "get",
        },
        {
          "args": [],
          "key": "method3",
          "type": "call",
        },
      ]
    `);
  });

  it('should handle nested object properties', () => {
    const obj = {
      user: {
        getName: () => 'John',
        getAddress: () => ({ city: 'New York', country: 'USA' }),
      },
      isAdmin: false,
    };

    const history = new BasicHistory();
    const spiedObj = createSpy(obj, history);

    expect(spiedObj.user.getName()).toEqual('John');
    expect(spiedObj.user.getAddress()).toEqual({ city: 'New York', country: 'USA' });
    expect(spiedObj.isAdmin).toEqual(false);

    expect(history.getAll()).toMatchInlineSnapshot(`
      [
        {
          "key": "user",
          "type": "get",
        },
        {
          "key": "user.getName",
          "type": "get",
        },
        {
          "args": [],
          "key": "user.getName",
          "type": "call",
        },
        {
          "key": "user",
          "type": "get",
        },
        {
          "key": "user.getAddress",
          "type": "get",
        },
        {
          "args": [],
          "key": "user.getAddress",
          "type": "call",
        },
        {
          "key": "isAdmin",
          "type": "get",
        },
      ]
    `);
  });

  it('should handle array elements', () => {
    const obj = {
      numbers: [1, 2, 3],
      getFirstElement: () => obj.numbers[0],
    };

    const history = new BasicHistory();
    const spiedObj = createSpy(obj, history);

    expect(spiedObj.numbers[1]).toEqual(2);
    expect(spiedObj.getFirstElement()).toEqual(1);

    expect(history.getAll()).toMatchInlineSnapshot(`
      [
        {
          "key": "numbers",
          "type": "get",
        },
        {
          "key": "numbers.1",
          "type": "get",
        },
        {
          "key": "getFirstElement",
          "type": "get",
        },
        {
          "args": [],
          "key": "getFirstElement",
          "type": "call",
        },
      ]
    `);
  });
});
