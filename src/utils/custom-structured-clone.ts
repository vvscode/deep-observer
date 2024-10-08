import { TARGET_SYMBOL } from '../proxy-target';

export function customStructuredClone<T>(el: T): T {
  if (el instanceof Function) {
    return el;
  }
  if (Array.isArray(el)) {
    return el.map(customStructuredClone) as T;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return structuredClone(((el as any)[TARGET_SYMBOL] ?? el) as T);
  } catch (e) {
    console.error(e, `Error on cloning`, el, 'fallback is returned');
    return JSON.parse(JSON.stringify(el)) as T;
  }
}
