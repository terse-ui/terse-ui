import {
  afterRenderEffect,
  type CreateEffectOptions,
  effect,
  type EffectCleanupRegisterFn,
  type EffectRef,
  untracked,
} from '@angular/core';
import {type BaseEffectNode, SIGNAL} from '@angular/core/primitives/signals';
import type {Fn, MaybeElementSignal, MaybeSignal, WithInjector} from '../types';
import {assertEventTarget} from './assert';
import {NOOP_EFFECT_REF} from './constants';
import {injCtx} from './inj-ctx';
import {unrefElement} from './inject-element';
import {toValue} from './to-value';

export type ListenerOptions = WithInjector;

export interface ListenerRef {
  readonly destroy: () => void;
}

export interface OnFunction {
  <E extends keyof WindowEventMap>(
    target: Window,
    event: MaybeSignal<E>,
    handler: (this: Window, e: WindowEventMap[E]) => unknown,
    options?: ListenerOptions,
  ): ListenerRef;

  <E extends keyof DocumentEventMap>(
    target: Document,
    event: MaybeSignal<E>,
    handler: (this: Document, e: DocumentEventMap[E]) => unknown,
    options?: ListenerOptions,
  ): ListenerRef;

  <E extends keyof ShadowRootEventMap>(
    target: MaybeSignal<ShadowRoot>,
    event: MaybeSignal<E>,
    handler: (this: ShadowRoot, e: ShadowRootEventMap[E]) => unknown,
    options?: ListenerOptions,
  ): ListenerRef;

  <T extends HTMLElement, E extends keyof HTMLElementEventMap>(
    target: MaybeElementSignal<T>,
    event: MaybeSignal<E>,
    handler: (this: T, e: HTMLElementEventMap[E]) => unknown,
    options?: ListenerOptions,
  ): ListenerRef;

  <T extends SVGElement, E extends keyof SVGElementEventMap>(
    target: MaybeElementSignal<T>,
    event: MaybeSignal<E>,
    handler: (this: T, e: SVGElementEventMap[E]) => unknown,
    options?: ListenerOptions,
  ): ListenerRef;

  <Names extends string>(
    target: MaybeSignal<InferEventTarget<Names>>,
    event: MaybeSignal<Names>,
    handler: (e: Event) => void,
    options?: ListenerOptions,
  ): ListenerRef;

  <EventType = Event>(
    target: MaybeSignal<EventTarget> | MaybeElementSignal<Element>,
    event: MaybeSignal<string>,
    handler: GeneralEventListener<EventType>,
    options?: ListenerOptions,
  ): ListenerRef;

  readonly capture: OnFunction;
  readonly passive: OnFunction;
  readonly once: OnFunction;
  readonly stop: OnFunction;
  readonly prevent: OnFunction;
  readonly self: OnFunction;
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
 * @example
 * ```typescript
 * @Component({
 *   template: `<button #btn>Click me</button>`,
 * })
 * export class ListenerDemo {
 *   readonly btn = viewChild<ElementRef>('btn');
 *
 *   constructor() {
 *     listener.capture.prevent(this.btn, 'click', event => {
 *       console.log('Button clicked!', event);
 *     });
 *   }
 * }
 * ```
 */
export const on: OnFunction = createModifier({});

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

function onImpl(applied: InternalListenerOptions, ...args: unknown[]): ListenerRef {
  const options = args[3] as ListenerOptions | undefined;

  return injCtx(onImpl, options?.injector, ({isServer}) => {
    if (isServer) {
      return NOOP_EFFECT_REF;
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
    const untrackedHandler = function (this: unknown, event: Event): void {
      untracked(() => (handler as Fn<unknown, [Event]>).call(this, event));
    };

    const setupListener = (onCleanup: EffectCleanupRegisterFn): void => {
      const raw = toValue(maybeReactiveTarget);
      const target = unrefElement(raw) as HTMLElement;
      const event = toValue(maybeReactiveEvent) as string;

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

    return {
      destroy: () => {
        effectRef.destroy();
      },
    };
  });
}

const MODIFIERS = new Set<keyof InternalListenerOptions>([
  'capture',
  'passive',
  'once',
  'stop',
  'prevent',
  'self',
]);

function createModifier(applied: InternalListenerOptions): OnFunction {
  const modifierFn = ((...args: unknown[]) => {
    return onImpl(applied, ...args);
  }) as OnFunction;

  return new Proxy(modifierFn, {
    get(target, prop) {
      if (typeof prop !== 'string' || !MODIFIERS.has(prop as keyof InternalListenerOptions)) {
        return target[prop as keyof typeof target];
      }

      if (applied[prop as keyof InternalListenerOptions]) {
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
      console.warn('[syncEffect] Failed to run effectFn synchronously', error);
    }
  }
  return effectRef;
}

interface InternalListenerOptions {
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

type GeneralEventListener<E = Event> = (e: E) => void;
