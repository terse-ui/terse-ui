import {
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  model,
  output,
  signal,
} from '@angular/core';

/**
 * Observes the host element's intersection with the viewport.
 *
 * @example
 * ```html
 * <img atomIntersect (atomIntersect)="load()" />
 * ```
 */
@Directive({
  selector: '[atomIntersect]',
  exportAs: 'atomIntersect',
  host: {
    '[attr.data-intersecting]': 'dataIntersectingAttr()',
  },
})
export class AtomIntersect {
  readonly #element = inject(ElementRef).nativeElement as HTMLElement;

  /** Emits when intersection state changes. */
  readonly intersect = output<IntersectionObserverEntry>({alias: 'atomIntersect'});

  /** Disables intersection observation. */
  readonly disabled = model(false, {alias: 'atomIntersectDisabled'});

  /** The intersection threshold(s). */
  readonly threshold = model<number | number[]>(0, {alias: 'atomIntersectThreshold'});

  /** The root margin for the observer. */
  readonly rootMargin = model('0px', {alias: 'atomIntersectRootMargin'});

  readonly #isIntersecting = signal(false);
  /** Whether the element is currently intersecting. */
  readonly isIntersecting = this.#isIntersecting.asReadonly();

  protected readonly dataIntersectingAttr = computed(() =>
    this.disabled() ? null : this.isIntersecting() ? '' : null,
  );

  constructor() {
    const destroyRef = inject(DestroyRef);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry && !this.disabled()) {
          this.#isIntersecting.set(entry.isIntersecting);
          this.intersect.emit(entry);
        }
      },
      {
        threshold: this.threshold(),
        rootMargin: this.rootMargin(),
      },
    );

    observer.observe(this.#element);
    destroyRef.onDestroy(() => observer.disconnect());
  }
}
