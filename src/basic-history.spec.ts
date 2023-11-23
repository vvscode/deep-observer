import { BasicHistory } from './basic-history'; // Замените на путь к вашему файлу BasicHistory
import type { HistoryItem } from './types';

describe('BasicHistory', () => {
  let basicHistory: BasicHistory;

  beforeEach(() => {
    basicHistory = new BasicHistory();
  });

  it('put method adds history item', () => {
    const key = 'exampleKey';
    const item: HistoryItem = { type: 'get', key: 'example.key' };

    basicHistory.put(key, item);

    const result = basicHistory.getAll();
    expect(result[key]).toHaveLength(1);
    expect(result[key][0]).toEqual(item);
  });

  it('put method adds multiple history items for the same key', () => {
    const key = 'exampleKey';
    const item1: HistoryItem = { type: 'get', key: 'example.key1' };
    const item2: HistoryItem = { type: 'set', key: 'example.key2', value: 'someValue' };

    basicHistory.put(key, item1);
    basicHistory.put(key, item2);

    const result = basicHistory.getAll();
    expect(result[key]).toHaveLength(2);
    expect(result[key][0]).toEqual(item1);
    expect(result[key][1]).toEqual(item2);
  });

  it('getAll method returns a copy of the history', () => {
    const key = 'exampleKey';
    const item: HistoryItem = { type: 'call', key: 'example.method', args: [1, 2, 3] };

    basicHistory.put(key, item);

    const result = basicHistory.getAll();
    expect(result[key]).toHaveLength(1);

    // Modify the result, original history should not be affected
    result[key] = [];

    const updatedResult = basicHistory.getAll();
    expect(updatedResult[key]).toHaveLength(1);
  });
});
