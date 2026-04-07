import {inject, Injectable, runInInjectionContext, untracked, type Injector} from '@angular/core';
import {injEl, setupInjCtx, type InjCtxRef} from '@terse-ui/core/internal';
import type {Constructor} from '@terse-ui/core/internal/types';

@Injectable({providedIn: 'root'})
export class AutoHostResolver {
  readonly #instances = new WeakMap<HTMLElement, Map<Constructor, unknown>>();

  #get<T extends object>(element: HTMLElement): Map<Constructor<T>, T> {
    let serviceMap = this.#instances.get(element) as Map<Constructor<T>, T> | undefined;
    if (!serviceMap) {
      serviceMap = new Map();
      this.#instances.set(element, serviceMap);
    }
    return serviceMap;
  }

  resolve<T extends object>(type: Constructor<T>, injector?: Injector): T {
    return setupInjCtx(
      injector,
      this.resolve.bind(this),
    )(({injector}) => {
      const element = injEl();
      const serviceMap = this.#get<T>(element);
      let instance = serviceMap.get(type);
      if (!instance) {
        instance = untracked(() => runInInjectionContext(injector, () => new type()));
        serviceMap.set(type, instance);
      }
      return instance;
    });
  }

  static resolve<T extends object>(type: Constructor<T>, injector?: Injector): T {
    return inject(AutoHostResolver).resolve<T>(type, injector);
  }
}

export function AutoHost() {
  return <T extends object, C extends Constructor<T>>(constructor: C): C => {
    Object.defineProperty(constructor, '__NG_ELEMENT_ID__', {
      value: (): T => AutoHostResolver.resolve(constructor),
      configurable: true,
      enumerable: true,
      writable: true,
    });
    return constructor;
  };
}

export function autoHost<T>(
  name: string,
  factory: (ctx: InjCtxRef) => T,
): (injector?: Injector) => T {
  @AutoHost()
  class HostValue {
    readonly value = setupInjCtx()((ctx) => factory(ctx));
  }

  Object.defineProperty(HostValue, 'name', {value: name});
  Object.defineProperty(HostValue.prototype, Symbol.toStringTag, {value: name});

  return (injector?: Injector): T => {
    return setupInjCtx(injector, autoHost)(() => inject(HostValue).value as T);
  };
}
