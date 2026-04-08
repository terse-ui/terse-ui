import {
  computed,
  DestroyRef,
  Directive,
  DOCUMENT,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {type ListenerRef, listener, onLongPress} from '@signality/core';
import {injectElement} from '@terse-ui/core/internal';

/** Tags for editable elements that should not trigger keyboard press. */
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return EDITABLE_TAGS.has(target.tagName) || target.isContentEditable;
}

/**
 * Tracks whether the host element is actively being pressed via pointer or keyboard.
 *
 * @example
 * ```html
 * <button atomPress (atomPressStart)="onStart()" (atomPressEnd)="onEnd()">
 *   Press me
 * </button>
 * ```
 */
@Directive({
  selector: '[atomPress]',
  exportAs: 'atomPress',
  host: {
    '[attr.data-press]': 'dataPressAttr()',
    '(pointerdown)': 'onPointerDown($event)',
    '(keydown)': 'onKeyDown($event)',
    '(blur)': 'onBlur()',
  },
})
export class AtomPress {
  readonly #el = injectElement();
  readonly #doc = inject(DOCUMENT);
  readonly #injector = inject(Injector);

  readonly #isPressed = signal(false);

  /** Whether the element is currently being pressed. */
  readonly isPressed = this.#isPressed.asReadonly();

  /** Disables press tracking. */
  readonly disabled = model(false, {alias: 'atomPressDisabled'});

  /**
   * Long-press delay in milliseconds. When greater than 0, enables long-press detection.
   * @defaultValue 0
   */
  readonly delay = input(0, {alias: 'atomPressDelay'});

  /**
   * Max pointer movement (px) before cancelling a long press. Set to `false` to disable.
   * @defaultValue 10
   */
  readonly distanceThreshold = input<number | false>(10, {alias: 'atomPressDistanceThreshold'});

  /** Emits when a press begins. */
  readonly pressStart = output<void>({alias: 'atomPressStart'});

  /** Emits when a press ends. */
  readonly pressEnd = output<void>({alias: 'atomPressEnd'});

  /** Emits the PointerEvent when a long press is detected. */
  readonly longPress = output<PointerEvent>({alias: 'atomPressLongPress'});

  readonly dataPressAttr = computed(() => (this.disabled() ? null : this.isPressed() ? '' : null));

  /** Tracks which key started the press to prevent mismatched keyup releases. */
  #activeKey: string | null = null;

  #pointerRefs: ListenerRef[] = [];
  #keyRefs: ListenerRef[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.#removePointerListeners();
      this.#removeKeyListeners();
    });

    onLongPress(
      this.#el,
      (event) => {
        if (!this.disabled() && this.delay() > 0) {
          this.longPress.emit(event);
        }
      },
      {
        delay: this.delay,
        distanceThreshold: this.distanceThreshold(),
        injector: this.#injector,
      },
    );
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled() || event.button !== 0) return;

    this.#startPress();
    this.#attachPointerListeners(event.pointerId);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.repeat) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (isEditableTarget(event.target)) return;

    if (event.key === ' ') {
      event.preventDefault();
    }

    this.#activeKey = event.key;
    this.#startPress();
    this.#attachKeyListeners();
  }

  protected onBlur(): void {
    if (this.#activeKey !== null) {
      this.#activeKey = null;
      this.#removeKeyListeners();
      this.#endPress();
    }
  }

  #startPress(): void {
    if (!this.#isPressed()) {
      this.#isPressed.set(true);
      this.pressStart.emit();
    }
  }

  #endPress(): void {
    if (this.#isPressed()) {
      this.#isPressed.set(false);
      this.pressEnd.emit();
    }
  }

  #attachPointerListeners(pointerId: number): void {
    this.#removePointerListeners();

    const reset = () => {
      this.#removePointerListeners();
      this.#endPress();
    };

    // Use pointermove instead of pointerleave for iOS Safari compatibility.
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const rect = this.#el.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        reset();
      }
    };

    const opts = {injector: this.#injector};
    this.#pointerRefs = [
      listener(this.#doc, 'pointerup', reset, opts),
      listener(this.#doc, 'pointercancel', reset, opts),
      listener(this.#doc, 'pointermove', onPointerMove as EventListener, opts),
    ];
  }

  #attachKeyListeners(): void {
    this.#removeKeyListeners();

    this.#keyRefs = [
      listener(
        this.#doc,
        'keyup',
        (e: KeyboardEvent) => {
          if (e.key === this.#activeKey) {
            this.#activeKey = null;
            this.#removeKeyListeners();
            this.#endPress();
          }
        },
        {injector: this.#injector},
      ),
    ];
  }

  #removePointerListeners(): void {
    this.#pointerRefs.forEach((ref) => ref.destroy());
    this.#pointerRefs = [];
  }

  #removeKeyListeners(): void {
    this.#keyRefs.forEach((ref) => ref.destroy());
    this.#keyRefs = [];
  }
}
