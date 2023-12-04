import { DeepPartial, HistoryItem } from '../types';
import { deepPartiallyMatch } from './deep-partially-match';

describe('deepPartiallyMatch with deepPartial', () => {
  it('compares by value is one of params is not an object', () => {
    expect(deepPartiallyMatch({}, null)).toBeFalsy();
    expect(deepPartiallyMatch(1, [])).toBeFalsy();
    expect(deepPartiallyMatch([], 'x')).toBeFalsy();
  });

  it('should return true for identical HistoryItems with nested objects', () => {
    const item: HistoryItem = { type: 'get', key: 'a', args: [{ nested: 42 }] };
    expect(deepPartiallyMatch(item, item)).toBe(true);
  });

  it('should return true for deeply equal HistoryItems with nested objects', () => {
    const item1: HistoryItem = { type: 'get', key: 'a', args: [{ nested: 42 }] };
    const item2: HistoryItem = { type: 'get', key: 'a', args: [{ nested: 42 }] };
    expect(deepPartiallyMatch(item1, item2)).toBe(true);
  });

  it('should return true for HistoryItems with partial match and partial match nested objects', () => {
    const item1: HistoryItem = { type: 'call', key: 'b', args: [{ nested: 42, other: 'value' }] };
    const item2: DeepPartial<HistoryItem> = { type: 'call', key: 'b', args: [{ nested: 42 }] };
    expect(deepPartiallyMatch(item1, item2)).toBe(true);
  });

  it('should return true for HistoryItems with partial match and partial nesting (no objects in the list)', () => {
    const item1: HistoryItem = { type: 'call', key: 'b', args: [{ nested: 42, other: 'value' }] };
    const item2: DeepPartial<HistoryItem> = { type: 'call', key: 'b', args: [] };
    expect(deepPartiallyMatch(item1, item2)).toBe(true);
  });

  it('should return false for HistoryItems with partial match and partial micmatch on nesting', () => {
    const item1: HistoryItem = { type: 'call', key: 'b', args: [{ nested: 42, other: 'value' }] };
    const item2: DeepPartial<HistoryItem> = {
      type: 'call',
      key: 'b',
      args: [{ value: 42, other: 'other value' }],
    };
    expect(deepPartiallyMatch(item1, item2)).toBe(false);
  });

  it('should return true for HistoryItems with partial match and partial nesting (no list)', () => {
    const item1: HistoryItem = { type: 'call', key: 'b', args: [{ nested: 42, other: 'value' }] };
    const item2: DeepPartial<HistoryItem> = { type: 'call', key: 'b' };
    expect(deepPartiallyMatch(item1, item2)).toBe(true);
  });

  it('should return false for non-matching HistoryItems with nested objects', () => {
    const item1: HistoryItem = { type: 'get', key: 'a', args: [{ nested: 42 }] };
    const item2: HistoryItem = { type: 'get', key: 'a', args: [{ nested: 43 }] };
    expect(deepPartiallyMatch(item1, item2)).toBe(false);
  });

  it('should return true for deeply equal nested objects with different structures', () => {
    const obj1 = { a: { b: { c: 42 } } };
    const obj2 = { a: { b: { c: 42 } } };
    expect(deepPartiallyMatch(obj1, obj2)).toBe(true);
  });

  it('should return true for partial match with deeply nested objects', () => {
    const obj1 = { a: { b: { c: 42, d: 'value' } } };
    const obj2: DeepPartial<typeof obj1> = { a: { b: { d: 'value' } } };
    expect(deepPartiallyMatch(obj1, obj2)).toBe(true);
  });

  it('should return false for non-matching nested objects', () => {
    const obj1 = { a: { b: { c: 42 } } };
    const obj2 = { a: { b: { c: 43 } } };
    expect(deepPartiallyMatch(obj1, obj2)).toBe(false);
  });
});
