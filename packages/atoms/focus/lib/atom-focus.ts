import {computed, Directive, model, signal} from '@angular/core';
import {elementFocus} from '@signality/core';
import {injectElement} from '@terse-ui/core/internal';

/**
 * Tracks focus state on the host element, distinguishing keyboard-triggered focus.
 *
 * @example
 * ```html
 * <button atomFocus>Save</button>
 * ```
 */
@Directive({
  selector: '[atomFocus]',
  exportAs: 'atomFocus',
  host: {
    '[attr.data-focus]': 'dataFocusAttr()',
    '[attr.data-focus-visible]': 'dataFocusVisibleAttr()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class AtomFocus {
  readonly #el = injectElement();

  /** Whether the element is currently focused. Writable — set `true` to focus, `false` to blur. */
  readonly isFocused = elementFocus(this.#el);

  readonly #isFocusVisible = signal(false);
  /** Whether the element has keyboard-triggered focus. */
  readonly isFocusVisible = this.#isFocusVisible.asReadonly();

  /** Disables focus tracking when `true`. */
  readonly disabled = model(false, {alias: 'atomFocusDisabled'});

  protected readonly dataFocusAttr = computed(() =>
    this.disabled() ? null : this.isFocused() ? '' : null,
  );

  protected readonly dataFocusVisibleAttr = computed(() =>
    this.disabled() ? null : this.isFocusVisible() ? '' : null,
  );

  protected onFocus(): void {
    if (this.disabled()) return;
    this.#isFocusVisible.set(this.#el.matches(':focus-visible'));
  }

  protected onBlur(): void {
    this.#isFocusVisible.set(false);
  }
}
