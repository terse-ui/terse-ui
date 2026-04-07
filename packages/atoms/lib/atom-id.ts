import {Directive, inject} from '@angular/core';
import {IdGenerator} from '@terse-ui/core/internal';

/**
 * Atomic host ID directive.
 *
 * @example
 * ```html
 * <div atomId>
 *   <h1>Hello, world!</h1>
 * </div>
 * <!-- Renders: <div id="atom-1"> -->
 * ```
 */
@Directive({
  selector: '[atomId]',
  host: {
    '[id]': 'value',
  },
})
export class AtomId {
  readonly #generator = inject(IdGenerator);

  /**
   * The generated atom ID from {@link IdGenerator} and applied to the host element's `id` attribute.
   */
  readonly value = this.#generator.generate('atom');
}
