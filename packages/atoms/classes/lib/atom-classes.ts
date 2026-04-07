import {isPlatformServer} from '@angular/common';
import {computed, DestroyRef, Directive, inject, input, PLATFORM_ID, signal} from '@angular/core';
import {injEl, optsBuilder} from '@terse-ui/core/internal';

export interface AtomClassOptions<T> {
  reducer: (acc: T, curr: T) => string | undefined;
}

const [provideAtomClassOpts, injectAtomClassOpts] = optsBuilder<AtomClassOptions<unknown>>(
  'AtomClass',
  () => ({
    reducer: (acc, curr) => acc + ' ' + curr,
  }),
);

export {provideAtomClassOpts};

@Directive({
  selector: '[atomClass]',
  exportAs: 'atomClass',
  host: {
    '[class]': 'classValue()',
  },
})
export class AtomClass<T> {
  readonly #opts = injectAtomClassOpts();
  readonly class = input<T | undefined>(undefined, {alias: 'atomClass'});

  readonly #sources = signal<((current: T) => T)[]>([]);

  protected readonly classValue = computed(() =>
    this.#sources().reduce(this.#opts.reducer, this.class()),
  );

  constructor() {
    if (isPlatformServer(inject(PLATFORM_ID))) {
      return;
    }

    // Transition suppression during hydration — when SSR classes differ from client classes, the browser can flash unwanted CSS transitions.
    // We handle this by setting transition: none !important before the first class write, then restoring it after a requestAnimationFrame.

    const element = injEl();
    const prev = element.style.getPropertyValue('transition');
    const prevPriority = element.style.getPropertyPriority('transition');

    element.style.setProperty('transition', 'none', 'important');

    const rafId = requestAnimationFrame(() => {
      if (prev) {
        element.style.setProperty('transition', prev, prevPriority || undefined);
      } else {
        element.style.removeProperty('transition');
      }
    });

    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(rafId);
    });
  }

  register(fn: (current: T) => T): () => void {
    this.#sources.update((sources) => [fn, ...sources]);
    return () => {
      this.#sources.update((sources) => sources.filter((s) => s !== fn));
    };
  }
}
