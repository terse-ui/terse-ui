import {isPlatformServer} from '@angular/common';
import type {Injector} from '@angular/core';
import {
  untracked as _untracked,
  afterRenderEffect,
  type CreateEffectOptions,
  effect,
  type EffectCleanupRegisterFn,
  type EffectRef,
  inject,
  isSignal,
  PLATFORM_ID,
  untracked,
} from '@angular/core';
import {type BaseEffectNode, SIGNAL} from '@angular/core/primitives/signals';
import type {Fn, MaybeElSignal, MaybeSignal} from '../../types';
import {setupInjCtx} from '../inj-ctx';
import {unrefEl} from '../inj-el';
import {isEventTarget} from '../validators';

export type OnOpts = {
  readonly injector?: Injector;
};

export interface OnRef {
  readonly destroy: () => void;
}

export interface OnFn {
  <E extends keyof WindowEventMap>(
    target: Window,
    event: MaybeSignal<E>,
    handler: (this: Window, e: WindowEventMap[E]) => unknown,
    options?: OnOpts,
  ): OnRef;

  <E extends keyof DocumentEventMap>(
    target: Document,
    event: MaybeSignal<E>,
    handler: (this: Document, e: DocumentEventMap[E]) => unknown,
    options?: OnOpts,
  ): OnRef;

  <E extends keyof ShadowRootEventMap>(
    target: MaybeSignal<ShadowRoot>,
    event: MaybeSignal<E>,
    handler: (this: ShadowRoot, e: ShadowRootEventMap[E]) => unknown,
    options?: OnOpts,
  ): OnRef;

  <T extends HTMLElement, E extends keyof HTMLElementEventMap>(
    target: MaybeElSignal<T>,
    event: MaybeSignal<E>,
    handler: (this: T, e: HTMLElementEventMap[E]) => unknown,
    options?: OnOpts,
  ): OnRef;

  <T extends SVGElement, E extends keyof SVGElementEventMap>(
    target: MaybeElSignal<T>,
    event: MaybeSignal<E>,
    handler: (this: T, e: SVGElementEventMap[E]) => unknown,
    options?: OnOpts,
  ): OnRef;

  <Names extends string>(
    target: MaybeSignal<InferEventTarget<Names>>,
    event: MaybeSignal<Names>,
    handler: (e: Event) => void,
    options?: OnOpts,
  ): OnRef;

  <EventType = Event>(
    target: MaybeSignal<EventTarget> | MaybeElSignal<Element>,
    event: MaybeSignal<string>,
    handler: GeneralEventListener<EventType>,
    options?: OnOpts,
  ): OnRef;

  readonly capture: OnFn;
  readonly passive: OnFn;
  readonly once: OnFn;
  readonly stop: OnFn;
  readonly prevent: OnFn;
  readonly self: OnFn;
}

/**
 * Signal-based wrapper around the [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method.
 *
 * @param target - Event target
 * @param event - Event type name
 * @param handler - Event handler function
 * @param options - Optional listener configuration
 * @returns A ListenerRef that can be used to destroy the listener
 *
 * @internal
 *
 * @remarks
 * Adapted from @signality/core listener
 */
export const on: OnFn = createModifier({});

let isSyncSetupRequired = false;

/**
 * By default, `listener()` registers event listeners after the render cycle completes
 * to ensure DOM elements exist. However, global targets (window, document, navigator.*, etc.)
 * are not tied to the render cycle. Use `setupSync()` to wrap listener calls when you need to prevent
 * race conditions where a global event is dispatched before Angular completes its scheduled rendering tasks.
 */
export function setupSync<T>(listenerFactoryExecFn: () => T): T {
  isSyncSetupRequired = true;

  try {
    return listenerFactoryExecFn();
  } finally {
    isSyncSetupRequired = false;
  }
}

function onImpl(applied: InternalOnOpts, ...args: unknown[]): OnRef {
  const options = args[3] as OnOpts | undefined;

  const runner = setupInjCtx(options?.injector, onImpl);

  return runner(() => {
    if (isPlatformServer(inject(PLATFORM_ID))) {
      return {destroy: () => void 0};
    }

    const [maybeReactiveTarget, maybeReactiveEvent, rawHandler] = args;
    const {stop, prevent, self, ...nativeOptions} = applied;
    const hasModifiers = stop || prevent || self;

    const handler = hasModifiers
      ? function (this: unknown, event: Event) {
          if (self && event.target !== event.currentTarget) return;
          if (prevent) event.preventDefault();
          if (stop) event.stopPropagation();
          (rawHandler as Fn<unknown, [Event]>).call(this, event);
        }
      : rawHandler;

    // Isolate event handler from signal dependency tracking.
    // Angular's template compiler does this via setActiveConsumer(null) in executeListenerWithErrorHandling.
    // Without this, events that fire during change detection (e.g. window 'blur' when the tab loses focus)
    // can trigger NG0600 if the handler writes to a signal while a reactive consumer is active.
    // See: https://github.com/angular/angular/issues/60143
    const untrackedHandler = function (this: unknown, event: Event) {
      untracked(() => (handler as Fn<unknown, [Event]>).call(this, event));
    };

    const setupListener = (onCleanup: EffectCleanupRegisterFn) => {
      const raw = toValue(maybeReactiveTarget);
      const target = unrefEl(raw as Element);
      const event = toValue(maybeReactiveEvent) as keyof ElementEventMap;

      if (!target) {
        return;
      }

      if (ngDevMode) {
        assertEventTarget(target, 'listener');
      }

      target.addEventListener(event, untrackedHandler, nativeOptions);

      onCleanup(() => {
        target.removeEventListener(event, untrackedHandler, nativeOptions);
      });
    };

    let effectRef: EffectRef;

    if (isSyncSetupRequired) {
      effectRef = syncEffect(setupListener);
    } else {
      effectRef = afterRenderEffect({read: setupListener});
    }

    return {destroy: () => effectRef.destroy()};
  });
}

const MODIFIERS = new Set<keyof InternalOnOpts>([
  'capture',
  'passive',
  'once',
  'stop',
  'prevent',
  'self',
]);

function createModifier(applied: InternalOnOpts): OnFn {
  const modifierFn = ((...args: unknown[]) => {
    return onImpl(applied, ...args);
  }) as OnFn;

  return new Proxy(modifierFn, {
    get(target, prop) {
      if (typeof prop !== 'string' || !MODIFIERS.has(prop as keyof typeof target)) {
        return target[prop as keyof typeof target];
      }

      if (applied[prop as keyof InternalOnOpts]) {
        return target;
      }

      return createModifier({...applied, [prop]: true});
    },
  });
}

function syncEffect(
  effectFn: (onCleanup: EffectCleanupRegisterFn) => void,
  options?: CreateEffectOptions,
): EffectRef {
  const effectRef = effect(effectFn, options);
  const effectNode = (effectRef as unknown as Record<symbol, unknown>)[SIGNAL] as BaseEffectNode;
  try {
    effectNode.run();
  } catch (error) {
    if (ngDevMode) {
      // eslint-disable-next-line no-console
      console.warn('[syncEffect] Failed to run effectFn synchronously', error);
    }
  }
  return effectRef;
}

interface InternalOnOpts {
  readonly capture?: boolean;
  readonly passive?: boolean;
  readonly once?: boolean;
  readonly stop?: boolean;
  readonly prevent?: boolean;
  readonly self?: boolean;
}

interface InferEventTarget<Events> {
  readonly addEventListener: (event: Events, fn?: unknown, options?: unknown) => unknown;
  readonly removeEventListener: (event: Events, fn?: unknown, options?: unknown) => unknown;
}

interface GeneralEventListener<E = Event> {
  (e: E): void;
}

export interface ToValueFn {
  <T>(maybeSignal: MaybeSignal<T>): T;
  untracked: <T>(maybeSignal: MaybeSignal<T>) => T;
}

export const toValue: ToValueFn = (() => {
  const fn = toValueFn as ToValueFn;
  fn.untracked = (v) => toValueFn(v, true);
  return fn;
})();

function toValueFn<T>(maybeSignal: MaybeSignal<T>, untracked = false): T {
  if (isSignal(maybeSignal)) {
    return untracked ? _untracked(maybeSignal) : maybeSignal();
  }
  return maybeSignal;
}

export function assertEventTarget(value: unknown, source: string): asserts value is EventTarget {
  if (!isEventTarget(value)) {
    throw new Error(
      `[${source}] Expected an EventTarget, ElementRef but received: ${
        (value as object).constructor?.name ?? typeof value
      }. ` +
        `If you are using viewChild/contentChild, specify "{ read: ElementRef }" to avoid implicit directive references.`,
    );
  }
}
