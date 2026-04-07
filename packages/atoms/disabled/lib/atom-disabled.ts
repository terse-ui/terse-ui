import {Directive, model} from '@angular/core';

/**
 * Manages disabled state on the host element with `data-disabled` and `aria-disabled`.
 *
 * @example
 * ```html
 * <button atomDisabled [atomDisabled]="loading()">Save</button>
 * ```
 */
@Directive({
  selector: '[atomDisabled]',
  exportAs: 'atomDisabled',
  host: {
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class AtomDisabled {
  /** Whether the element is disabled. */
  readonly disabled = model(false, {alias: 'atomDisabled'});
}
