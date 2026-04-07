import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import {listener} from '@signality/core';
import {
  defineCfg,
  hasDisabledAttribute,
  injectElement,
  isAnchorElement,
  isButtonElement,
  isInputElement,
} from '@terse-ui/core/internal';
import {HostAttributes} from '@terse-ui/core/utils/host';

export interface ProtoButtonConfig {
  disabled: boolean;
  disabledInteractive: boolean;
  tabIndex: number;
  role: string | null;
  type: string | null;
  composite: boolean;
}

const [provideButtonConfig, injectButtonConfig] = defineCfg<ProtoButtonConfig>(() => {
  const ha = inject(HostAttributes);
  return {
    disabled: false,
    disabledInteractive: false,
    tabIndex: numberAttribute(ha.get('tabindex') ?? 0, 0),
    role: ha.get('role'),
    type: ha.get('type'),
    composite: false,
  };
});

export {provideButtonConfig};

@Directive({
  selector: '[protoButton]',
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.data-disabled]': 'dataDisabledAttr()',
    '[attr.tabindex]': 'tabIndexAttr()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '[attr.role]': 'roleAttr()',
    '[attr.type]': 'typeAttr()',
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
  },
  exportAs: 'protoButton',
})
export class ProtoButton {
  readonly #element = injectElement();
  readonly #config = injectButtonConfig();

  readonly disabled = input(this.#config.disabled, {transform: booleanAttribute});

  readonly disabledInteractive = input(this.#config.disabledInteractive, {
    transform: booleanAttribute,
  });

  readonly hardDisabled = computed(() => this.disabled() && !this.disabledInteractive());
  readonly softDisabled = computed(() => this.disabled() && this.disabledInteractive());

  protected readonly attrDisabled = computed(() =>
    this.#hasNativeDisabled ? (this.disabled() && !this.disabledInteractive() ? '' : null) : null,
  );

  protected readonly dataDisabledAttr = computed(() =>
    this.disabled() ? (this.hardDisabled() ? 'hard' : 'soft') : null,
  );

  protected readonly ariaDisabledAttr = computed(() => {
    if (
      (this.#hasNativeDisabled && this.disabledInteractive()) ||
      (!this.#hasNativeDisabled && this.disabled())
    ) {
      return this.disabled();
    }
    return null;
  });

  readonly tabIndex = input(this.#config.tabIndex, {
    transform: (v) => numberAttribute(v, this.#config.tabIndex),
  });

  protected readonly tabIndexAttr = computed(() => {
    let tabIndex = this.tabIndex();
    if (!this.#hasNativeDisabled && this.disabled()) {
      tabIndex = this.disabledInteractive() ? tabIndex : -1;
    }
    return tabIndex;
  });

  readonly role = input(this.#config.role);
  protected readonly roleAttr = computed(
    () =>
      this.role() ??
      (this.#isNativeButton || this.#isValidLink || this.#isNativeInput ? null : 'button'),
  );

  readonly type = input(this.#config.type);
  protected readonly typeAttr = computed(
    () => this.type() ?? (this.#isNativeButton ? 'button' : null),
  );

  constructor() {
    effect(() => {
      console.log(this.disabled());
    });

    // Capture-phase listener registered early so it fires before Angular's
    // template-bound (click) handlers and can block them when disabled.
    listener.capture(this.#element, 'click', (event) => {
      if (this.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  get #hasNativeDisabled(): boolean {
    return hasDisabledAttribute(this.#element);
  }
  get #isNativeButton(): boolean {
    return isButtonElement(this.#element);
  }
  get #isValidLink(): boolean {
    return isAnchorElement(this.#element, {validLink: true});
  }
  get #isNativeInput(): boolean {
    return isInputElement(this.#element, {
      types: ['button', 'submit', 'reset', 'image'],
    });
  }

  /** Whether the host element has native button-like activation (Enter/Space). */
  get #isNativeActivatable(): boolean {
    return this.#isNativeButton || this.#isNativeInput;
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.softDisabled() && event.key !== 'Tab') {
      event.preventDefault();
    }

    if (this.disabled()) {
      return;
    }

    if (this.#isNativeActivatable && !this.#config.composite) {
      return;
    }

    const isCurrentTarget = event.target === event.currentTarget;
    if (!isCurrentTarget) {
      return;
    }

    // Composite: Space fires click immediately on keydown.
    if (this.#config.composite && event.key === ' ') {
      event.preventDefault();
      this.#element.click();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.#element.click();
    } else if (event.key === ' ') {
      // Prevent scroll on Space for non-native buttons.
      event.preventDefault();
    }
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    // Composite buttons already handled Space on keydown — suppress here.
    if (this.#config.composite && event.key === ' ') {
      event.preventDefault();
      return;
    }

    if (this.#isNativeActivatable) {
      return;
    }

    if (event.target === event.currentTarget && event.key === ' ') {
      this.#element.click();
    }
  }
}
