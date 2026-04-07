import {
  assertInInjectionContext,
  DestroyRef,
  inject,
  INJECTOR,
  isSignal,
  runInInjectionContext,
  untracked,
  type Injector,
  type Signal,
} from '@angular/core';
import {SIGNAL, type SignalNode} from '@angular/core/primitives/signals';
import type {Fn} from '../../types';

export interface InjCtxRef {
  readonly injector: Injector;
  readonly onCleanup: (cleanup: () => void) => void;
}

/**
 * Runs a function in an injection context.
 * @internal
 *
 * @remarks
 * Adapted from @signality/core/internal setupContext
 */
export function setupInjCtx(inj?: Injector, dbgFn?: Fn) {
  if (typeof ngDevMode !== 'undefined' && ngDevMode && !inj) {
    assertInInjectionContext(dbgFn || setupInjCtx);
  }
  const ctxInj = inj ?? inject(INJECTOR);
  return function injCtx<T>(fn: (ctx: InjCtxRef) => T): T {
    const result = runInInjectionContext(ctxInj, () => {
      const ref = createRef();
      return untracked(() => fn(ref));
    });
    if (typeof ngDevMode !== 'undefined' && ngDevMode && result != null) {
      stampDbgNames(result, dbgFn || injCtx);
    }
    return result;
  };
}

function createRef(): InjCtxRef {
  const injector = inject(INJECTOR);
  const destroyRef = inject(DestroyRef);
  const onCleanup = (cleanup: () => void): void => {
    destroyRef.onDestroy(cleanup);
  };
  return {injector, onCleanup};
}

function stampDbgNames<T>(value: T, dbgFn: Fn): void {
  if (isSignal(value)) {
    setDbgName(value, dbgFn);
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, v] of Object.entries(value)) {
      if (isSignal(v)) setDbgName(v, dbgFn, key);
    }
  }
}

function setDbgName(signal: Signal<unknown>, dbgFn: Fn, postfix?: string): void {
  const node = signal[SIGNAL] as SignalNode<unknown>;
  node.debugName ??= dbgFn.name + (postfix ? '.' + postfix : '');
}
