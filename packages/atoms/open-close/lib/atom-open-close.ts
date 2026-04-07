import {computed, Directive, model} from '@angular/core';

/**
 * Tracks open/closed state on the host element.
 *
 * @example
 * ```html
 * <details atomOpenClose [atomOpenClose]="isOpen()">...</details>
 * ```
 */
@Directive({
  selector: '[atomOpenClose]',
  exportAs: 'atomOpenClose',
  host: {
    '[attr.data-open]': 'isOpen() ? "" : null',
    '[attr.data-closed]': '!isOpen() ? "" : null',
    '[attr.aria-expanded]': 'ariaExpanded()',
  },
})
export class AtomOpenClose {
  /** Whether the element is in an open state. */
  readonly isOpen = model(false, {alias: 'atomOpenClose'});

  /** @internal */
  protected readonly ariaExpanded = computed(() => `${this.isOpen()}`);
}
