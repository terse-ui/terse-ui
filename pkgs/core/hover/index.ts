import type {BooleanInput} from '@angular/cdk/coercion';
import {
  booleanAttribute,
  Directive,
  DOCUMENT,
  inject,
  Injectable,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';

@Injectable({providedIn: 'root'})
class GlobalPointerEvents {
  readonly #doc = inject(DOCUMENT);

  #globalIgnoreMouseEvents = false;
  #touchTimeout: ReturnType<typeof setTimeout> | undefined;

  get globalIgnoreMouseEvents(): boolean {
    return this.#globalIgnoreMouseEvents;
  }

  constructor() {
    this.#doc.addEventListener('pointerup', this.#onGlobalPointerUp.bind(this), {
      capture: true,
      passive: true,
    });
    this.#doc.addEventListener('touchend', this.#ignoreEmulatedMouse.bind(this), {
      capture: true,
      passive: true,
    });
  }

  #ignoreEmulatedMouse(): void {
    this.#globalIgnoreMouseEvents = true;
    clearTimeout(this.#touchTimeout);
    this.#touchTimeout = setTimeout(() => (this.#globalIgnoreMouseEvents = false), 50);
  }

  #onGlobalPointerUp(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      this.#ignoreEmulatedMouse();
    }
  }
}

@Directive({
  selector: '[baseHover]',
  host: {
    '[attr.data-hover]': '!disabled() && isHovered() ? "" : null',
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(touchstart)': 'onTouchStart()',
    '(mouseenter)': 'onMouseEnter($event)',
    '(mouseleave)': 'onMouseLeave($event)',
  },
  exportAs: 'baseHover',
})
export class BaseHover {
  readonly #globalPointerEvents = inject(GlobalPointerEvents);

  get globalIgnoreMouseEvents(): boolean {
    return this.#globalPointerEvents.globalIgnoreMouseEvents;
  }

  readonly disabledInput = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
    alias: 'baseHoverDisabled',
  });
  readonly disabled = linkedSignal(() => this.disabledInput());

  readonly hoverStart = output({alias: 'baseHoverStart'});
  readonly hoverEnd = output({alias: 'baseHoverEnd'});
  readonly hoverChange = output<boolean>({alias: 'baseHoverChange'});

  readonly #isHovered = signal(false);
  readonly isHovered = this.#isHovered.asReadonly();

  #localIgnoreMouseEvents = false;

  #onHoverBegin(event: Event, pointerType: string): void {
    if (pointerType === 'touch' || this.isHovered()) {
      return;
    }

    if (!(event.currentTarget as Element | null)?.contains(event.target as Element)) {
      return;
    }

    this.#isHovered.set(true);
    this.hoverChange.emit(true);
    this.hoverStart.emit();
  }

  #onHoverFinished(pointerType: string): void {
    if (pointerType === 'touch' || !this.isHovered()) {
      return;
    }

    this.#isHovered.set(false);
    this.hoverChange.emit(false);
    this.hoverEnd.emit();
  }

  onPointerEnter(event: PointerEvent): void {
    if (this.#globalPointerEvents.globalIgnoreMouseEvents && event.pointerType === 'mouse') {
      return;
    }

    this.#onHoverBegin(event, event.pointerType);
  }

  onPointerLeave(event: PointerEvent): void {
    if ((event.currentTarget as Element | null)?.contains(event.target as Element)) {
      this.#onHoverFinished(event.pointerType);
    }
  }

  onTouchStart(): void {
    this.#localIgnoreMouseEvents = true;
  }

  onMouseEnter(event: MouseEvent): void {
    if (!this.#localIgnoreMouseEvents && !this.#globalPointerEvents.globalIgnoreMouseEvents) {
      this.#onHoverBegin(event, 'mouse');
    }

    this.#localIgnoreMouseEvents = false;
  }

  onMouseLeave(event: MouseEvent): void {
    if ((event.currentTarget as Element | null)?.contains(event.target as Element)) {
      this.#onHoverFinished('mouse');
    }
  }
}
