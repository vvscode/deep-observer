import type { History } from './types';

const isObject = (value: any) => typeof value === 'object' && value !== null;
const isFunction = (value: any) => typeof value === 'function';

const shouldProxy = (obj: any) => isObject(obj) || isFunction(obj);

export function createSpy<T>(obj: T, history: History): T & { history: History } {
  const proxyCache = new Map<any, any>();

  function createProxy(target: any, path: string[] = []): any {
    const cacheKey = path.join('.'); // Use the path as the cache key

    if (proxyCache.has(cacheKey)) {
      return proxyCache.get(cacheKey);
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
      apply: (target, thisArg, args) => {
        history.put(path.join('.'), { type: 'call', key: path.join('.'), args });
        return Reflect.apply(target, thisArg, args);
      },
    });

    proxyCache.set(cacheKey, proxy);
    return proxy;
  }

  return createProxy(obj) as T & { history: History };
}
