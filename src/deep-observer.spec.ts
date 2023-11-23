import { BasicHistory, createSpy } from './deep-observer';

it('should create a spy and record history', () => {
  const obj = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    method1: (x: unknown) => 'result1',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    method2: (y: unknown) => 'result2',
  };

  const history = new BasicHistory();
  const spiedObj = createSpy(obj, history);

  expect(spiedObj.method1(1)).toEqual('result1');
  expect(spiedObj.method2({ b: [] })).toEqual('result2');

  expect(history.getAll()).toMatchInlineSnapshot(
    `
    {
      "method1": [
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
      ],
      "method2": [
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
      ],
    }
  `,
  );
});
