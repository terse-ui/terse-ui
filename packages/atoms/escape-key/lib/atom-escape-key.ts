import {Directive, model, output} from '@angular/core';

/**
 * Emits when the Escape key is pressed on the host element or its descendants.
 *
 * @example
 * ```html
 * <div atomEscapeKey (atomEscapeKey)="close()">...</div>
 * ```
 */
@Directive({
  selector: '[atomEscapeKey]',
  exportAs: 'atomEscapeKey',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class AtomEscapeKey {
  /** Emits the `KeyboardEvent` when Escape is pressed. */
  readonly escapeKey = output<KeyboardEvent>({alias: 'atomEscapeKey'});

  /** Disables escape key detection. */
  readonly disabled = model(false, {alias: 'atomEscapeKeyDisabled'});

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.disabled()) {
      this.escapeKey.emit(event);
    }
  }
}
