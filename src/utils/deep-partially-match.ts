import { isObject } from '../types';

export function deepPartiallyMatch(item: unknown, match: unknown): boolean {
  if (!isObject(item) || !isObject(match)) {
    return item === match;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyMatch = match as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyItem = item as any;
  for (const key in anyMatch) {
    if (anyMatch.hasOwnProperty(key)) {
      const matchValue = anyMatch[key];

      if (isObject(anyItem[key]) && isObject(matchValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!deepPartiallyMatch(anyItem[key], matchValue as any)) {
          return false;
        }
      } else if (anyItem[key] !== matchValue) {
        return false;
      }
    }
  }

  return true;
}
