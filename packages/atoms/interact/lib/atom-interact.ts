import {booleanAttribute, computed, Directive, inject, input, numberAttribute} from '@angular/core';
import {listener} from '@signality/core';
import {
  hasDisabledAttribute,
  injectElement,
  optsBuilder,
  signalControl,
} from '@terse-ui/core/internal';
import {HostAttributes} from '@terse-ui/core/utils/host';

export interface AtomInteractOpts {
  /** Whether the element is disabled by default. */
  disabled: boolean;

  /** Whether the element is disabled interactively by default, allowing it to be focused. */
  disabledInteractive: boolean;

  /** The initial value of the tabindex input. */
  tabIndex: number;
}

const [provideAtomInteractOpts, injectAtomInteractOpts] = optsBuilder<AtomInteractOpts>(
  'AtomInteract',
  () => {
    const hostAttribs = inject(HostAttributes);
    return {
      disabled: false,
      disabledInteractive: false,
      tabIndex: numberAttribute(hostAttribs.get('tabindex') ?? 0, 0),
    };
  },
);

export {provideAtomInteractOpts};

@Directive({
  selector: '[atomInteract]',
  exportAs: 'atomInteract',
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.data-disabled]': 'dataDisabledAttr()',
    '[attr.tabindex]': 'tabIndexAttr()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class AtomInteract {
  readonly #element = injectElement();
  readonly #opts = injectAtomInteractOpts();

  readonly disabled = input(this.#opts.disabled, {
    transform: booleanAttribute,
  });
  readonly disabledControl = signalControl(this.disabled);

  readonly disabledInteractive = input(this.#opts.disabledInteractive, {
    transform: booleanAttribute,
  });
  readonly disabledInteractiveControl = signalControl(this.disabledInteractive);

  readonly tabIndex = input(this.#opts.tabIndex, {
    transform: (v) => numberAttribute(v, this.#opts.tabIndex),
  });
  readonly tabIndexControl = signalControl(this.tabIndex);

  readonly hardDisabled = computed(
    () => this.disabledControl() && !this.disabledInteractiveControl(),
  );
  readonly softDisabled = computed(
    () => this.disabledControl() && this.disabledInteractiveControl(),
  );

  protected readonly attrDisabled = computed(() =>
    this.#hasNativeDisabled
      ? this.disabledControl() && !this.disabledInteractiveControl()
        ? ''
        : null
      : null,
  );

  protected readonly dataDisabledAttr = computed(() =>
    this.disabledControl() ? (this.hardDisabled() ? 'hard' : 'soft') : null,
  );

  protected readonly ariaDisabledAttr = computed(() => {
    if (
      (this.#hasNativeDisabled && this.disabledInteractiveControl()) ||
      (!this.#hasNativeDisabled && this.disabledControl())
    ) {
      return this.disabledControl();
    }
    return null;
  });

  protected readonly tabIndexAttr = computed(() => {
    let tabIndex = this.tabIndexControl();
    if (!this.#hasNativeDisabled && this.disabledControl()) {
      tabIndex = this.disabledInteractiveControl() ? tabIndex : -1;
    }
    return tabIndex;
  });

  constructor() {
    // Capture-phase listener registered early so it fires before Angular's
    // template-bound (click) handlers and can block them when disabled.
    listener.capture(this.#element, 'click', (event) => {
      if (this.disabledControl()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  get #hasNativeDisabled(): boolean {
    return hasDisabledAttribute(this.#element);
  }

  /**
   * Blocks activation keys (Enter, Space) when soft-disabled.
   * Navigation keys (arrows, Escape, Home, End, Tab) are always allowed
   * so parent containers (menus, listboxes, toolbars) can still navigate
   * through soft-disabled items.
   */
  protected onKeyDown(event: KeyboardEvent): void {
    if (this.softDisabled() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
  }
}
