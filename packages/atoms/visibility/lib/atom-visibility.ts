import type {Signal} from '@angular/core';
import {computed, Directive, input, model} from '@angular/core';
import {elementVisibility} from '@signality/core';
import {injectElement} from '@terse-ui/core/internal';

/**
 * Observes the host element's visibility within the viewport using `elementVisibility()`.
 *
 * @example
 * ```html
 * <section atomVisibility (atomVisibilityChange)="onVisible($event)">
 *   Lazy-loaded content
 * </section>
 * ```
 */
@Directive({
  selector: '[atomVisibility]',
  exportAs: 'atomVisibility',
  host: {
    '[attr.data-visible]': 'dataVisibleAttr()',
    '[attr.data-hidden]': 'dataHiddenAttr()',
  },
})
export class AtomVisibility {
  readonly #el = injectElement();

  /** Intersection threshold(s). Read once at initialization. */
  readonly threshold = input<number | number[]>(0, {alias: 'atomVisibilityThreshold'});

  /** Root margin for the observer. Read once at initialization. */
  readonly rootMargin = input('0px', {alias: 'atomVisibilityRootMargin'});

  /** Disables visibility observation and data attributes. */
  readonly disabled = model(false, {alias: 'atomVisibilityDisabled'});

  /** Raw signality visibility signal. */
  readonly visibility = elementVisibility(this.#el, {
    threshold: this.threshold(),
    rootMargin: this.rootMargin(),
  });

  /** Whether the element is currently visible in the viewport. */
  readonly isVisible: Signal<boolean> = computed(() => this.visibility().isVisible);

  /** Intersection ratio of the element within the viewport. */
  readonly ratio: Signal<number> = computed(() => this.visibility().ratio);

  protected readonly dataVisibleAttr = computed(() =>
    this.disabled() ? null : this.isVisible() ? '' : null,
  );

  protected readonly dataHiddenAttr = computed(() =>
    this.disabled() ? null : !this.isVisible() ? '' : null,
  );
}
