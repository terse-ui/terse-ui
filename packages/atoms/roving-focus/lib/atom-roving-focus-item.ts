import {computed, DestroyRef, Directive, inject, model} from '@angular/core';
import {IdGenerator, injectElement} from '@terse-ui/core/internal';
import {ROVING_FOCUS_GROUP, type RovingFocusItemRef} from './atom-roving-focus-group';

/**
 * An item within a roving focus group. Manages its own tabindex
 * based on whether it is the active item in the group.
 *
 * @example
 * ```html
 * <li atomRovingFocusItem>Option</li>
 * ```
 */
@Directive({
  selector: '[atomRovingFocusItem]',
  exportAs: 'atomRovingFocusItem',
  host: {
    '[attr.tabindex]': 'tabindex()',
    '(click)': 'onClick()',
  },
})
export class AtomRovingFocusItem {
  readonly #group = inject(ROVING_FOCUS_GROUP);
  readonly #element = injectElement();
  readonly #id = inject(IdGenerator).generate('roving');

  /** Whether this item is disabled and should be skipped during navigation. */
  readonly disabled = model(false, {alias: 'atomRovingFocusItemDisabled'});

  /** The computed tabindex: 0 when active, -1 otherwise. */
  readonly tabindex = computed(() => (this.#group.isActive(this.#id) ? 0 : -1));

  constructor() {
    const ref: RovingFocusItemRef = {
      id: this.#id,
      element: this.#element,
      disabled: () => this.disabled(),
      focus: () => this.#element.focus(),
    };

    this.#group.register(ref);
    inject(DestroyRef).onDestroy(() => this.#group.unregister(ref));
  }

  /** @internal */
  protected onClick(): void {
    if (!this.disabled()) {
      this.#group.setActive(this.#id);
    }
  }
}
