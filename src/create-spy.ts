import type { History } from './types';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;
const isFunction = (value: unknown) => typeof value === 'function';

// eslint-disable-next-line @typescript-eslint/ban-types -- it's require by Reflect.apply
const shouldProxy = (value: unknown): value is object | Function =>
  isObject(value) || isFunction(value);

export function createSpy<T>(obj: T, history: History): T {
  const proxyCache = new Map<string, unknown>();

  function createProxy(target: unknown, path: string[] = []): unknown {
    const cacheKey = path.join('.'); // Use the path as the cache key

    if (proxyCache.has(cacheKey)) {
      return proxyCache.get(cacheKey);
    }

    if (!shouldProxy(target)) {
      throw new TypeError('target should be an object');
    }

    const proxy = new Proxy(target, {
      get: (target, key, receiver) => {
        let err;
        let value;
        try {
          value = Reflect.get(target, key, receiver);
        } catch (error) {
          err = error;
        }

        history.put(path.concat(String(key)).join('.'), { type: 'get', key });

        if (err) {
          throw err;
        }

        return shouldProxy(value) ? createProxy(value, path.concat(String(key))) : value;
      },
      set: (target, key, value, receiver) => {
        history.put(path.concat(String(key)).join('.'), { type: 'set', key, value });
        return Reflect.set(target, key, value, receiver);
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      apply: (target: Function, thisArg, args) => {
        history.put(path.join('.'), { type: 'call', key: path.join('.'), args });
        return Reflect.apply(target, thisArg, args);
      },
    });

    proxyCache.set(cacheKey, proxy);
    return proxy;
  }

  return createProxy(obj) as T;
}
