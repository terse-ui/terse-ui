import {isPlatformServer} from '@angular/common';
import {
  afterNextRender,
  computed,
  Directive,
  inject,
  input,
  PLATFORM_ID,
  Renderer2,
  RendererStyleFlags2,
  signal,
} from '@angular/core';
import {injectElement, optsBuilder} from '@terse-ui/core/internal';
import {HostAttributes} from '@terse-ui/core/utils/host';
import {clsx, type ClassValue} from 'clsx';

export interface AtomClassesOptions {
  mapResult: (result: ClassValue[]) => string;
}

const [provideAtomClassesOpts, injectAtomClassesOpts] = optsBuilder<AtomClassesOptions>(
  'AtomClasses',
  {
    mapResult: (result) => clsx(result),
  },
);

export {provideAtomClassesOpts};

@Directive({
  selector: '[atomClasses]',
  exportAs: 'atomClasses',
  host: {
    '[class]': 'classValue()',
  },
})
export class AtomClasses {
  readonly #renderer = inject(Renderer2);
  readonly #opts = injectAtomClassesOpts();
  readonly #hostAttribs = inject(HostAttributes);

  readonly #hostClass = this.#hostAttribs.get('class');

  /**
   * ClassValue to be applied to the host element.
   */
  readonly class = input<ClassValue>(this.#hostClass, {alias: 'atomClasses'});

  readonly #pre = signal<(() => ClassValue[] | string)[]>([]);
  readonly #post = signal<(() => ClassValue[] | string)[]>([]);

  protected readonly classValue = computed(() => {
    const pre = this.#pre().map((s) => s());
    const post = this.#post().map((s) => s());
    return this.#opts.mapResult([...pre, this.class(), ...post])?.trim() || '';
  });

  constructor() {
    if (isPlatformServer(inject(PLATFORM_ID))) {
      return;
    }

    // Suppress transitions before the first paint so Angular's [class] binding
    // doesn't trigger CSS transitions when hydrating from SSR-rendered classes.
    const el = injectElement();
    const prev = el.style.getPropertyValue('transition');
    const prevPriority = el.style.getPropertyPriority('transition');
    this.#renderer.setStyle(el, 'transition', 'none', RendererStyleFlags2.Important);

    // Restore after the first render — the browser will have painted the correct
    // classes with transitions disabled, so re-enabling is safe.
    afterNextRender(() => {
      if (prev) {
        this.#renderer.setStyle(
          el,
          'transition',
          prev,
          prevPriority === 'important' ? RendererStyleFlags2.Important : undefined,
        );
      } else {
        this.#renderer.removeStyle(el, 'transition');
      }
    });
  }

  /**
   * Register a reactive class source to be applied **before** the base `class` input.
   * Later registrations take higher precedence (appended to the end).
   *
   * The `fn` callback is invoked inside a `computed()`, so any signals read
   * within it are automatically tracked — the class list re-evaluates when they change.
   *
   * @param fn - A reactive function returning class values. Signals read inside are tracked.
   * @returns A function to unregister the class source.
   */
  pre(fn: () => ClassValue[] | string): () => void {
    this.#pre.update((sources) => [...sources, fn]);
    return () => {
      this.#pre.update((sources) => sources.filter((s) => s !== fn));
    };
  }

  /**
   * Register a reactive class source to be applied **after** the base `class` input.
   * Later registrations take higher precedence (appended to the end).
   *
   * Post sources override both `pre` sources and the base `class` input when classes conflict.
   * Prefer {@link AtomClasses.pre} unless you explicitly need to override the consumer's `class` input.
   *
   * The `fn` callback is invoked inside a `computed()`, so any signals read
   * within it are automatically tracked — the class list re-evaluates when they change.
   *
   * @param fn - A reactive function returning class values. Signals read inside are tracked.
   * @returns A function to unregister the class source.
   */
  post(fn: () => ClassValue[] | string): () => void {
    this.#post.update((sources) => [...sources, fn]);
    return () => {
      this.#post.update((sources) => sources.filter((s) => s !== fn));
    };
  }
}
