import {Directive, model} from '@angular/core';

/** Orientation direction. */
export type AtomOrientationValue = 'horizontal' | 'vertical';

/**
 * Sets orientation data and ARIA attributes on the host element.
 *
 * @example
 * ```html
 * <div atomOrientation="vertical">...</div>
 * ```
 */
@Directive({
  selector: '[atomOrientation]',
  exportAs: 'atomOrientation',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-orientation]': 'orientation()',
  },
})
export class AtomOrientation {
  /** The orientation direction. @defaultValue `'horizontal'` */
  readonly orientation = model<AtomOrientationValue>('horizontal', {alias: 'atomOrientation'});
}
