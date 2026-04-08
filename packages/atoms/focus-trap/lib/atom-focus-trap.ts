import {afterNextRender, Directive, DOCUMENT, inject, model} from '@angular/core';
import {activeElement, listener, mutationObserver} from '@signality/core';
import {AtomInteract} from '@terse-ui/atoms/interact';
import {injectElement} from '@terse-ui/core/internal';

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

/** Whether an element is visible (not hidden via display/visibility). */
function isVisible(el: HTMLElement): boolean {
  if (el.hidden) return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  return style?.display !== 'none' && style?.visibility !== 'hidden';
}

/**
 * Traps keyboard focus within the host element via Tab wrapping.
 *
 * @example
 * ```html
 * <div atomFocusTrap>
 *   <input placeholder="First" />
 *   <button>Action</button>
 *   <input placeholder="Last" />
 * </div>
 * ```
 */
@Directive({
  selector: '[atomFocusTrap]',
  exportAs: 'atomFocusTrap',
  hostDirectives: [AtomInteract],
  host: {
    '[attr.data-focus-trap]': 'disabled() ? null : ""',
    '(keydown)': 'onKeydown($event)',
  },
})
export class AtomFocusTrap {
  readonly #interact = inject(AtomInteract);

  /** Disables the focus trap. */
  readonly disabled = model(false, {alias: 'atomFocusTrapDisabled'});

  /** Whether to auto-focus the first tabbable element on init. */
  readonly autoFocus = model(true, {alias: 'atomFocusTrapAutoFocus'});

  readonly #element = injectElement();
  readonly #activeElement = activeElement();

  constructor() {
    this.#interact.tabIndexControl.control((d) => (this.disabled() ? d : -1));

    afterNextRender(() => {
      if (this.autoFocus() && !this.disabled()) {
        const [first] = this.#getTabbableEdges();
        first?.focus();
      }
    });

    mutationObserver(
      this.#element,
      () => {
        if (this.disabled()) {
          return;
        }

        // If the focused element was removed, refocus the container
        if (!this.#element.contains(this.#activeElement())) {
          const [first] = this.#getTabbableEdges();
          if (first) {
            first.focus();
          } else {
            this.#element.focus();
          }
        }
      },
      {childList: true, subtree: true},
    );

    listener.capture(inject(DOCUMENT), 'focusin', (event) => {
      if (this.disabled()) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target || this.#element.contains(target)) {
        return;
      }

      // Redirect focus back inside the trap
      const [first] = this.#getTabbableEdges();
      if (first) {
        first.focus();
      } else {
        this.#element.focus();
      }
    });
  }

  /** Returns the first and last tabbable elements within the container. */
  #getTabbableEdges() {
    const candidates = this.#element.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR);
    const tabbable = Array.from(candidates).filter(isVisible);
    return [tabbable[0] ?? null, tabbable[tabbable.length - 1] ?? null];
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || this.disabled()) {
      return;
    }

    const [first, last] = this.#getTabbableEdges();
    if (!first || !last) {
      // No tabbable elements — prevent Tab from leaving
      event.preventDefault();
      return;
    }

    if (event.shiftKey && this.#activeElement() === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.#activeElement() === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
