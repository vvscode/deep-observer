import { BasicHistory, createSpy } from './object-chronicler';

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

  it('should correctly check the existence of history items using the "has" method', () => {
    const obj = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      method1: (x: unknown) => 'result1',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      method2: (y: unknown) => 'result2',
      method3: () => 'result3',
      user: {
        getName: () => void 0,
        getAddress: () => void 0,
      },
    };

    const history = new BasicHistory();
    const spiedObj = createSpy(obj, history);

    // Invoke some methods
    spiedObj.method1(1);
    spiedObj.method2({ b: [] });

    // Check if the history contains certain items
    expect(history.has({ type: 'get', key: 'method1' })).toBe(true);
    expect(history.has({ type: 'call', key: 'method1', args: [1] })).toBe(true);
    expect(history.has({ type: 'get', key: 'method2' })).toBe(true);
    expect(history.has({ type: 'call', key: 'method2', args: [{ b: [] }] })).toBe(true);
    expect(history.has({ type: 'get', key: 'method3' })).toBe(false); // This method wasn't called

    // Additional checks for nested properties
    expect(history.has({ type: 'get', key: 'user.getName' })).toBe(false); // This method wasn't called
    expect(history.has({ type: 'get', key: 'user.getAddress' })).toBe(false); // This method wasn't called

    // Invoke more methods
    spiedObj.user.getName();
    spiedObj.user.getAddress();

    // Check if the history contains certain items after invoking additional methods
    expect(history.has({ type: 'get', key: 'user.getName' })).toBe(true);
    expect(history.has({ type: 'call', key: 'user.getName', args: [] })).toBe(true);
    expect(history.has({ type: 'get', key: 'user.getAddress' })).toBe(true);
    expect(history.has({ type: 'call', key: 'user.getAddress', args: [] })).toBe(true);
  });

  it('should throw type error if history is not an instance of History', () => {
    expect(() => {
      createSpy({}, undefined as unknown as BasicHistory);
    }).toThrow('history should be an implementation of History');
  });
});
