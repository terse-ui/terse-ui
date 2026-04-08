import {
  computed,
  effect,
  linkedSignal,
  untracked,
  type CreateEffectOptions,
  type Injector,
  type Signal,
} from '@angular/core';
import {injectCtx} from './inject-ctx';
import {isUndefined} from './validators';

export function signalControl<T>(source: Signal<T>) {
  const control = linkedSignal(() => source());
  return Object.assign(control, {
    control(
      binder: (current: T) => T | undefined,
      opts?: {injector?: Injector; options?: CreateEffectOptions; track?: boolean},
    ) {
      return injectCtx(
        opts?.injector,
        this.control,
      )(() => {
        const value = opts?.track
          ? computed(() => binder(control()))
          : computed(() => binder(untracked(() => control())));
        return effect(() => {
          const v = value();
          if (!isUndefined(v)) {
            control.set(v);
          }
        }, opts?.options);
      });
    },
  });
}
