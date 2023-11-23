import { BasicHistory } from './basic-history'; // Замените на путь к вашему файлу BasicHistory
import type { HistoryItem } from './types';

describe('BasicHistory', () => {
  let basicHistory: BasicHistory;

  beforeEach(() => {
    basicHistory = new BasicHistory();
  });

  it('put method adds history item', () => {
    const item: HistoryItem = { type: 'get', key: 'example.key' };

    basicHistory.put(item);

    const result = basicHistory.getAll();
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "key": "example.key",
          "type": "get",
        },
      ]
    `);
  });

  it('put method adds multiple history items for the same key', () => {
    const item1: HistoryItem = { type: 'get', key: 'example.key1' };
    const item2: HistoryItem = { type: 'set', key: 'example.key2', value: 'someValue' };

    basicHistory.put(item1);
    basicHistory.put(item2);

    const result = basicHistory.getAll();
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "key": "example.key1",
          "type": "get",
        },
        {
          "key": "example.key2",
          "type": "set",
          "value": "someValue",
        },
      ]
    `);
  });

  it('getAll method returns a copy of the history', () => {
    const item: HistoryItem = { type: 'call', key: 'example.method', args: [1, 2, 3] };

    basicHistory.put(item);

    const result = basicHistory.getAll();
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "args": [
            1,
            2,
            3,
          ],
          "key": "example.method",
          "type": "call",
        },
      ]
    `);

    // Modify the result, original history should not be affected
    result[0] = {} as HistoryItem;

    const updatedResult = basicHistory.getAll();
    expect(updatedResult).toMatchInlineSnapshot(`
      [
        {
          "args": [
            1,
            2,
            3,
          ],
          "key": "example.method",
          "type": "call",
        },
      ]
    `);
  });
});
