import {Directive, forwardRef, InjectionToken, model, signal} from '@angular/core';

/** Orientation for keyboard arrow mapping. */
export type RovingOrientation = 'horizontal' | 'vertical';

/** Registered item within a roving focus group. */
export interface RovingFocusItemRef {
  readonly id: string;
  readonly element: HTMLElement;
  readonly disabled: () => boolean;
  focus(): void;
}

/** Injection token for the roving focus group. */
export const ROVING_FOCUS_GROUP = new InjectionToken<AtomRovingFocusGroup>('AtomRovingFocusGroup');

/**
 * Manages arrow-key navigation and roving tabindex across a group of focusable items.
 *
 * @example
 * ```html
 * <ul atomRovingFocusGroup>
 *   <li atomRovingFocusItem>One</li>
 *   <li atomRovingFocusItem>Two</li>
 *   <li atomRovingFocusItem>Three</li>
 * </ul>
 * ```
 */
@Directive({
  selector: '[atomRovingFocusGroup]',
  exportAs: 'atomRovingFocusGroup',
  providers: [{provide: ROVING_FOCUS_GROUP, useExisting: forwardRef(() => AtomRovingFocusGroup)}],
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class AtomRovingFocusGroup {
  /** The navigation orientation. Defaults to `'vertical'`. */
  readonly orientation = model<RovingOrientation>('vertical', {
    alias: 'atomRovingFocusGroupOrientation',
  });

  /** Whether navigation wraps from last to first and vice versa. */
  readonly wrap = model(true, {alias: 'atomRovingFocusGroupWrap'});

  /** Whether Home/End keys navigate to first/last items. */
  readonly homeEnd = model(true, {alias: 'atomRovingFocusGroupHomeEnd'});

  /** Disables all keyboard navigation. */
  readonly disabled = model(false, {alias: 'atomRovingFocusGroupDisabled'});

  readonly #items = signal<RovingFocusItemRef[]>([]);
  readonly #activeId = signal<string | null>(null);

  /** The id of the currently active (tabbable) item. */
  readonly activeId = this.#activeId.asReadonly();

  /** Whether a given item id is the active item. */
  isActive(id: string): boolean {
    return this.#activeId() === id;
  }

  /** Register an item. Called by AtomRovingFocusItem on init. */
  register(item: RovingFocusItemRef): void {
    this.#items.update((items) => [...items, item]);

    // First registered item becomes tabbable
    if (!this.#activeId()) {
      this.#activeId.set(item.id);
    }
  }

  /** Unregister an item. Called by AtomRovingFocusItem on destroy. */
  unregister(item: RovingFocusItemRef): void {
    this.#items.update((items) => items.filter((i) => i !== item));

    if (this.#activeId() === item.id) {
      this.#activeId.set(this.#items()[0]?.id ?? null);
    }
  }

  /** Activate a specific item by id and focus it. */
  setActive(id: string): void {
    this.#activeId.set(id);
    const item = this.#items().find((i) => i.id === id);
    item?.focus();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const orientation = this.orientation();

    switch (event.key) {
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault();
          this.#activatePrev();
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault();
          this.#activateNext();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault();
          this.#activatePrev();
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault();
          this.#activateNext();
        }
        break;
      case 'Home':
        if (this.homeEnd()) {
          event.preventDefault();
          this.#activateFirst();
        }
        break;
      case 'End':
        if (this.homeEnd()) {
          event.preventDefault();
          this.#activateLast();
        }
        break;
    }
  }

  #sorted(): RovingFocusItemRef[] {
    return [...this.#items()].sort((a, b) =>
      a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
  }

  #activateFirst(): void {
    const item = this.#sorted().find((i) => !i.disabled());
    if (item) this.setActive(item.id);
  }

  #activateLast(): void {
    const item = [...this.#sorted()].reverse().find((i) => !i.disabled());
    if (item) this.setActive(item.id);
  }

  #activateNext(): void {
    const sorted = this.#sorted();
    const idx = sorted.findIndex((i) => i.id === this.#activeId());
    const next = sorted.slice(idx + 1).find((i) => !i.disabled());

    if (next) {
      this.setActive(next.id);
    } else if (this.wrap()) {
      this.#activateFirst();
    }
  }

  #activatePrev(): void {
    const sorted = this.#sorted();
    const idx = sorted.findIndex((i) => i.id === this.#activeId());
    const prev = sorted
      .slice(0, idx)
      .reverse()
      .find((i) => !i.disabled());

    if (prev) {
      this.setActive(prev.id);
    } else if (this.wrap()) {
      this.#activateLast();
    }
  }
}
