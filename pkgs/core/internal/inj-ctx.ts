import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  type Injector,
  INJECTOR,
  isSignal,
  runInInjectionContext,
  type Signal,
  untracked,
} from '@angular/core';
import {SIGNAL, type SignalNode} from '@angular/core/primitives/signals';
import {IS_BROWSER, IS_MOBILE, IS_SERVER} from '@terse-ui/core/internal';
import type {Fn} from '../types';

export interface InjCtxRef {
  readonly injector: Injector;
  readonly isServer: boolean;
  readonly isBrowser: boolean;
  readonly isMobile: boolean;
  readonly onCleanup: (cleanup: () => void) => void;
}

/**
 * @internal
 *
 * @param injector - injector to use for context
 * @param debugFn - context owner function
 */
export function injCtx<T>(
  debugFn: Fn | undefined,
  injector: Injector | undefined,
  fn: (context: InjCtxRef) => T,
): T {
  if (typeof ngDevMode !== 'undefined' && ngDevMode && !injector) {
    assertInInjectionContext(debugFn || injCtx);
  }

  const ctxInjector = injector || inject(INJECTOR);
  return runInInjCtxImpl(fn, ctxInjector, debugFn || injCtx);
}

function runInInjCtxImpl<T>(fn: (context: InjCtxRef) => T, injector: Injector, debugFn: Fn): T {
  const result = runInInjectionContext(injector, () => {
    const ref = createInjCtxRef();
    return untracked(() => fn(ref));
  });

  if (typeof ngDevMode !== 'undefined' && ngDevMode && result != null) {
    setupDebugInfo(result, debugFn);
  }

  return result;
}

export function createInjCtxRef(): InjCtxRef {
  const injector = inject(INJECTOR);
  const isBrowser = inject(IS_BROWSER);
  const isServer = inject(IS_SERVER);
  const isMobile = inject(IS_MOBILE);
  const destroyRef = inject(DestroyRef);

  const onCleanup = (cleanup: () => void): void => {
    destroyRef.onDestroy(cleanup);
  };

  return {injector, isBrowser, isServer, isMobile, onCleanup};
}

function setupDebugInfo<T>(value: T, debugFn: Fn): T {
  if (isSignal(value)) {
    setDebugName(value, debugFn);
  } else if (value && typeof value === 'object') {
    for (const [postfix, maybeSignal] of Object.entries(value)) {
      if (isSignal(maybeSignal)) {
        setDebugName(maybeSignal, debugFn, postfix);
      }
    }
  }

  return value;
}

function setDebugName(signal: Signal<unknown>, debugFn: Fn, postfix?: string): void {
  const node = signal[SIGNAL] as SignalNode<unknown>;

  if (node.debugName === undefined) {
    node.debugName = debugFn.name + (postfix ? '.' + postfix : '');
  }
}
