import {Directive, model, output} from '@angular/core';
import {onClickOutside} from '@signality/core';
import {injectElement} from '@terse-ui/core/internal';

/**
 * Emits when a pointer event occurs outside the host element.
 * Uses `composedPath()` for Shadow DOM compatibility and a pointer-down/pointer-up
 * sequence to avoid false positives from drag interactions.
 *
 * @example
 * ```html
 * <div atomClickOutside (atomClickOutside)="close()">Menu content</div>
 * ```
 */
@Directive({
  selector: '[atomClickOutside]',
  exportAs: 'atomClickOutside',
})
export class AtomClickOutside {
  readonly clickOutside = output<PointerEvent | FocusEvent>({alias: 'atomClickOutside'});

  /** Disables click-outside detection. */
  readonly disabled = model(false, {alias: 'atomClickOutsideDisabled'});

  constructor() {
    onClickOutside(injectElement(), (event) => {
      if (!this.disabled()) {
        this.clickOutside.emit(event);
      }
    });
  }
}
