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
        const value = Reflect.get(target, key, receiver);

        // if (isFunction(value)) {
        //   // If the property is a function, return a wrapped function
        //   const wrappedFunction = function (this: any, ...args: any[]) {
        //     // history.put(path.join('.'), { type: 'call', key: path.join('.'), args });
        //     return Reflect.apply(value, this, args);
        //   };

        //   return createProxy(wrappedFunction, path.concat(String(key)));
        // }

        history.put(path.concat(String(key)).join('.'), { type: 'get', key });
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
