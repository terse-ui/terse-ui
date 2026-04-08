import {computed, Directive, inject, input} from '@angular/core';
import {AtomInteract} from '@terse-ui/atoms/interact';
import {
  injectElement,
  isAnchorElement,
  isButtonElement,
  isInputElement,
  optsBuilder,
  signalControl,
} from '@terse-ui/core/internal';
import {HostAttributes} from '@terse-ui/core/utils/host';

export interface ProtoButtonOpts {
  role: string | null;
  type: string | null;
  composite: boolean;
}

const [provideButtonOpts, injectButtonOpts] = optsBuilder<ProtoButtonOpts>('ProtoButton', () => {
  const hostAttribs = inject(HostAttributes);
  return {
    role: hostAttribs.get('role'),
    type: hostAttribs.get('type'),
    composite: false,
  };
});

export {provideButtonOpts};

@Directive({
  selector: '[protoButton]',
  exportAs: 'protoButton',
  hostDirectives: [AtomInteract],
  host: {
    '[attr.role]': 'roleAttr()',
    '[attr.type]': 'typeAttr()',
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
  },
})
export class ProtoButton {
  readonly #element = injectElement();
  readonly #opts = injectButtonOpts();
  readonly #interact = inject(AtomInteract);

  readonly hardDisabled = this.#interact.hardDisabled.bind(this.#interact);
  readonly softDisabled = this.#interact.softDisabled.bind(this.#interact);

  readonly role = input(this.#opts.role);
  readonly roleControl = signalControl(this.role);
  protected readonly roleAttr = computed(
    () =>
      this.roleControl() ??
      (this.#isNativeButton || this.#isValidLink || this.#isNativeInput ? null : 'button'),
  );

  readonly type = input(this.#opts.type);
  readonly typeControl = signalControl(this.type);
  protected readonly typeAttr = computed(
    () => this.typeControl() ?? (this.#isNativeButton ? 'button' : null),
  );

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
    if (this.#interact.disabled()) {
      return;
    }

    if (this.#isNativeActivatable && !this.#opts.composite) {
      return;
    }

    const isCurrentTarget = event.target === event.currentTarget;
    if (!isCurrentTarget) {
      return;
    }

    // Composite: Space fires click immediately on keydown.
    if (this.#opts.composite && event.key === ' ') {
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
    if (this.#interact.disabled()) {
      return;
    }

    // Composite buttons already handled Space on keydown — suppress here.
    if (this.#opts.composite && event.key === ' ') {
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
