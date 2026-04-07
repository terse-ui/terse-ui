import {DestroyRef, Directive, DOCUMENT, inject, model, output} from '@angular/core';
import {injEl} from '@terse-ui/core/internal';

/**
 * Emits when a pointer event occurs outside the host element.
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
  readonly clickOutside = output<PointerEvent>({alias: 'atomClickOutside'});

  /** Disables click-outside detection. */
  readonly disabled = model(false, {alias: 'atomClickOutsideDisabled'});

  constructor() {
    const el = injEl();
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);

    const onPointerDown = (event: PointerEvent): void => {
      if (this.disabled()) {
        return;
      }

      const target = event.target as Node | null;
      if (target && !el.contains(target)) {
        this.clickOutside.emit(event);
      }
    };

    doc.addEventListener('pointerdown', onPointerDown);
    destroyRef.onDestroy(() => doc.removeEventListener('pointerdown', onPointerDown));
  }
}
