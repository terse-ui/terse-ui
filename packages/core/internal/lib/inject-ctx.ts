import {type Injector} from '@angular/core';
import {setupContext, type ContextRef} from '@signality/core/internal';
import type {Fn} from '../types';

export type InjectContextRef = ContextRef;

/**
 * Runs a function in an injection context.
 * @internal
 *
 * @remarks
 * Adapts setupContext form @signality/core/internal
 */
export function injectCtx(inj?: Injector, dbgFn?: Fn) {
  const {runInContext} = setupContext(inj, dbgFn);
  return runInContext;
}
