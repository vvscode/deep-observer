import { TARGET_SYMBOL } from './proxy-target';
import { type History, isFunction, isHistoryInstance, isObject } from './types';
import { customStructuredClone } from './utils/custom-structured-clone';

// eslint-disable-next-line @typescript-eslint/ban-types -- it's require by Reflect.apply
const isValidSpyTarget = (value: unknown): value is object | Function =>
  isObject(value) || isFunction(value);

const shouldProxy = (value: unknown, key: string | symbol) =>
  isValidSpyTarget(value) && !(isFunction(value) && (key === 'prototype' || key === 'constructor'));

export function createSpy<T>(obj: T, history: History): T {
  if (!isHistoryInstance(history)) {
    throw new TypeError('history should be an implementation of History');
  }

  const proxyCache = new Map<string, unknown>();

  function createProxy(target: unknown, path: string[] = []): unknown {
    const cacheKey = path.join('.'); // Use the path as the cache key

    if (proxyCache.has(cacheKey)) {
      return proxyCache.get(cacheKey);
    }

    if (!isValidSpyTarget(target)) {
      throw new TypeError('target should be an object');
    }

    const proxy = new Proxy(target, {
      get: (target, key, receiver) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let err: any;
        let value;

        if (key === TARGET_SYMBOL) {
          return target;
        }

        try {
          value = Reflect.get(target, key, receiver);
        } catch (error) {
          err = error;
        }

        /**
        // Potential direction to research in case shouldProxy() still gives fail cases
        // Check if the property is non-writable and non-configurable
        // https://stackoverflow.com/a/75150991/3400830
        if (
          err &&
          (err.message.includes("property 'prototype' is a read-only and non-configurable") ||
            err.message.includes("Cannot perform 'get' on a proxy that has been revoked"))
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (target as any)[key]; // Return the actual value of the property
        }
        */

        history.put({ type: 'get', key: path.concat(String(key)).join('.') });

        if (err) {
          throw err;
        }

        return shouldProxy(value, key) ? createProxy(value, path.concat(String(key))) : value;
      },
      set: (target, key, value, receiver) => {
        history.put({
          type: 'set',
          key: path.concat(String(key)).join('.'),
          value: customStructuredClone(value),
        });
        return Reflect.set(target, key, value, receiver);
      },
      // eslint-disable-next-line @typescript-eslint/ban-types
      apply: (target: Function, thisArg, args) => {
        history.put({
          type: 'call',
          key: path.join('.'),
          args: customStructuredClone(args),
        });
        return Reflect.apply(target, thisArg, args);
      },
    });

    proxyCache.set(cacheKey, proxy);
    return proxy;
  }

  return createProxy(obj) as T;
}
