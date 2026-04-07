# Terse UI — Atom Directive Candidates

Comprehensive research across 5 Angular UI libraries and Jeremy's local repos, deduplicated and ranked via pairwise comparison sort.

**Research sources:**

- Jeremy's Angular repos (`/home/jomby/code/` — terse-ui, terseware, terse_old, ng-primitives, verifin, zard)
- [spartan-ng/spartan](https://github.com/spartan-ng/spartan)
- [ng-primitives/ng-primitives](https://github.com/ng-primitives/ng-primitives)
- Angular Material / CDK
- PrimeNG
- DaisyUI (behavioral gaps analysis)

**Already built:** AtomId, AtomHover, AtomAnchor/AtomAnchored, AtomClass

---

## Top 10

| Rank | Atom                                    | Selector                 | Complexity  | Evidence              |
| ---- | --------------------------------------- | ------------------------ | ----------- | --------------------- |
| 1    | [AtomOpenClose](#1-atomopenclose)       | `[atomOpenClose]`        | Low         | 30+ usages, 2 sources |
| 2    | [AtomOrientation](#2-atomorientation)   | `[atomOrientation]`      | Low         | 15+ usages, 3 sources |
| 3    | [AtomFocusVisible](#3-atomfocusvisible) | `[atomFocusVisible]`     | Medium      | 15+ usages, 3 sources |
| 4    | [AtomEscapeKey](#4-atomescapekey)       | `[atomEscapeKey]`        | Low         | 15+ usages, 3 sources |
| 5    | [AtomDisabled](#5-atomdisabled)         | `[atomDisabled]`         | Low         | 10+ usages, 3 sources |
| 6    | [AtomPress](#6-atompress)               | `[atomPress]`            | Low-Medium  | 8+ usages, 3 sources  |
| 7    | [AtomIntersect](#7-atomintersect)       | `[atomIntersect]`        | Low         | 8+ usages, 2 sources  |
| 8    | [AtomRovingFocus](#8-atomrovingfocus)   | `[atomRovingFocusGroup]` | High        | 8+ usages, 3 sources  |
| 9    | [AtomClickOutside](#9-atomclickoutside) | `[atomClickOutside]`     | Low         | 6+ usages, 3 sources  |
| 10   | [AtomFocusTrap](#10-atomfocustrap)      | `[atomFocusTrap]`        | Medium-High | 5+ usages, 3 sources  |

---

## Full Ranked List

### 1. AtomOpenClose

Manages `data-open` / `data-closed` and `aria-expanded` for any toggleable component.

**Found in:** Jeremy's repos (30+ usages across dialog, tooltip, accordion, dropdown, select, menu, sheet, switch, toggle — the single most repeated host binding pattern), spartan-ng (`data-state` on every openable component)

```ts
@Directive({
  selector: '[atomOpenClose]',
  exportAs: 'atomOpenClose',
  host: {
    '[attr.data-open]': 'isOpen() || null',
    '[attr.data-closed]': '!isOpen() || null',
    '[attr.aria-expanded]': 'isOpen()',
  },
})
export class AtomOpenClose {
  readonly isOpen = model(false, {alias: 'atomOpenClose'});
}
```

|                   |                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------ |
| **Host bindings** | `[attr.data-open]`, `[attr.data-closed]`, `[attr.aria-expanded]`                     |
| **Inputs**        | `atomOpenClose: boolean` (model)                                                     |
| **Complexity**    | Low                                                                                  |
| **Composes into** | Accordion, dropdown, dialog, popover, collapsible, menu, disclosure, select, tooltip |

---

### 2. AtomOrientation

Sets `data-orientation` and `aria-orientation` for components with horizontal/vertical layout variants.

**Found in:** Jeremy's repos (15+ usages — separator, tabs, button-group, slider, toggle-group, menu, dropdown, carousel), CDK Listbox, spartan-ng (`BrnAccordion`, `BrnTabsList`, `BrnSeparator`), ng-primitives (roving focus, separator)

```ts
@Directive({
  selector: '[atomOrientation]',
  exportAs: 'atomOrientation',
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-orientation]': 'orientation()',
  },
})
export class AtomOrientation {
  readonly orientation = model<'horizontal' | 'vertical'>('horizontal', {
    alias: 'atomOrientation',
  });
}
```

|                   |                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Host bindings** | `[attr.data-orientation]`, `[attr.aria-orientation]`                                   |
| **Inputs**        | `atomOrientation: 'horizontal' \| 'vertical'` (model)                                  |
| **Complexity**    | Low                                                                                    |
| **Composes into** | Tabs, sliders, separators, toolbars, accordions, scrollable lists, roving focus groups |

---

### 3. AtomFocusVisible

Monitors focus origin (keyboard, mouse, touch, program) and exposes `data-focus-visible` for keyboard-only focus ring styling.

**Found in:** Jeremy's repos (15+ usages — iterated on more than any other pattern across terse_old), CDK `FocusMonitor`, spartan-ng (identical 15-line FocusMonitor boilerplate duplicated in `BrnSwitch`, `BrnCheckbox`, `BrnRadio`), ng-primitives (`NgpFocusVisible`)

```ts
@Directive({
  selector: '[atomFocusVisible]',
  exportAs: 'atomFocusVisible',
  host: {
    '[attr.data-focus-visible]': 'focusVisible() || null',
    '[attr.data-focus-origin]': 'focusOrigin()',
    '(focus)': '...',
    '(blur)': '...',
  },
})
export class AtomFocusVisible {
  readonly focusVisible: Signal<boolean>;
  readonly focusOrigin: Signal<'keyboard' | 'mouse' | 'touch' | 'program' | null>;
}
```

|                   |                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **Host bindings** | `[attr.data-focus-visible]`, `[attr.data-focus-origin]`                                                   |
| **Exposed**       | `focusVisible: Signal<boolean>`, `focusOrigin: Signal<FocusOrigin>`                                       |
| **Complexity**    | Medium — must distinguish keyboard from mouse/touch focus, handle text inputs (always show focus-visible) |
| **Composes into** | Every interactive component — buttons, inputs, links, toggles, menu items, tabs, checkboxes, radios       |

**Note:** Eliminates the exact same 15-line `FocusMonitor.monitor()` subscription pattern copy-pasted across 3+ spartan components.

---

### 4. AtomEscapeKey

Listens for the Escape key and emits an event, with optional `preventDefault` and `stopPropagation` for nested overlays.

**Found in:** Jeremy's repos (15+ usages — dialog, tooltip, menu, select, combobox, sheet), CDK `OverlayKeyboardDispatcher`, PrimeNG `hideOnEscape`, spartan-ng/ng-primitives (per-component Escape handling)

```ts
@Directive({
  selector: '[atomEscapeKey]',
  host: {
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class AtomEscapeKey {
  readonly escapeKey = output<KeyboardEvent>({alias: 'atomEscapeKey'});
  readonly disabled = model(false, {alias: 'atomEscapeKeyDisabled'});
}
```

|                   |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **Host bindings** | `(keydown.escape)` handler                                          |
| **Inputs**        | `atomEscapeKeyDisabled: boolean` (model)                            |
| **Outputs**       | `atomEscapeKey: KeyboardEvent`                                      |
| **Complexity**    | Low                                                                 |
| **Composes into** | Dialogs, popovers, dropdowns, menus, tooltips, overlays, comboboxes |

---

### 5. AtomDisabled

Unified disabled state — sets `data-disabled`, `aria-disabled`, and optionally prevents pointer events.

**Found in:** Jeremy's repos (10+ usages), CDK `InteractivityChecker`, spartan-ng (every interactive component independently binds `data-disabled` / `aria-disabled` / `disabled` — `BrnTabsTrigger` alone has 3 separate disabled bindings), ng-primitives (`ProtoDisableable`)

```ts
@Directive({
  selector: '[atomDisabled]',
  exportAs: 'atomDisabled',
  host: {
    '[attr.data-disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled()',
  },
})
export class AtomDisabled {
  readonly disabled = model(false, {alias: 'atomDisabled'});
}
```

|                   |                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Host bindings** | `[attr.data-disabled]`, `[attr.aria-disabled]`                                         |
| **Inputs**        | `atomDisabled: boolean` (model)                                                        |
| **Complexity**    | Low                                                                                    |
| **Composes into** | Buttons, inputs, selects, tabs, menu items, form controls, toggles, checkboxes, radios |

**Note:** ng-primitives already has a nearly identical `ProtoDisableable` directive. This is the most universally needed atom after AtomId.

---

### 6. AtomPress

Tracks pointer-down and keyboard activation state, setting `data-pressed` for visual feedback.

**Found in:** Jeremy's repos (8+ usages across terseware, terse_old, ng-primitives), ng-primitives (`NgpPress` — handles pointer capture, keyboard Enter/Space, iOS Safari edge cases), spartan-ng (no equivalent — uses raw `(click)` handlers)

```ts
@Directive({
  selector: '[atomPress]',
  exportAs: 'atomPress',
  host: {
    '[attr.data-pressed]': 'isPressed() || null',
    '(pointerdown)': 'onPointerDown($event)',
    // + global pointerup/pointermove/pointercancel
    '(keydown.enter)': '...',
    '(keydown.space)': '...',
  },
})
export class AtomPress {
  readonly isPressed: Signal<boolean>;
}
```

|                   |                                                                         |
| ----------------- | ----------------------------------------------------------------------- |
| **Host bindings** | `[attr.data-pressed]`, pointer and keyboard event handlers              |
| **Exposed**       | `isPressed: Signal<boolean>`                                            |
| **Complexity**    | Low-Medium — needs pointer-move boundary checking and keyboard handling |
| **Composes into** | Buttons, toggles, menu items, list items, action chips                  |

---

### 7. AtomIntersect

Wraps `IntersectionObserver` on the host element, emitting visibility events with configurable threshold.

**Found in:** Jeremy's repos (8+ usages — terseware `IntersectProto`, verifin, bettor_deal `visibility-tracker`), CDK (internal IntersectionObserver usage)

```ts
@Directive({
  selector: '[atomIntersect]',
  exportAs: 'atomIntersect',
  host: {
    '[attr.data-intersecting]': 'isIntersecting() || null',
  },
})
export class AtomIntersect {
  readonly isIntersecting: Signal<boolean>;
  readonly intersect = output<IntersectionObserverEntry>({alias: 'atomIntersect'});
}
```

|                   |                                                                   |
| ----------------- | ----------------------------------------------------------------- |
| **Host bindings** | `[attr.data-intersecting]`                                        |
| **Inputs**        | `threshold: number`, `rootMargin: string`                         |
| **Outputs**       | `atomIntersect: IntersectionObserverEntry`                        |
| **Complexity**    | Low                                                               |
| **Composes into** | Lazy loading, infinite scroll, virtual scroll triggers, analytics |

---

### 8. AtomRovingFocus

Two-directive pair managing arrow-key navigation and roving tabindex across a group of focusable items.

**Found in:** Jeremy's repos (8+ usages), CDK `ListKeyManager` (used by mat-menu, mat-select, mat-tab-group, mat-radio-group, mat-button-toggle-group, cdkListbox), ng-primitives (`NgpRovingFocusGroup` + `NgpRovingFocusItem`)

```ts
@Directive({selector: '[atomRovingFocusGroup]'})
export class AtomRovingFocusGroup {
  readonly orientation = model<'horizontal' | 'vertical' | 'both'>('vertical');
  readonly wrap = model(true);
  // Arrow, Home, End key handling
}

@Directive({selector: '[atomRovingFocusItem]'})
export class AtomRovingFocusItem {
  // Managed tabindex: 0 for active, -1 for others
}
```

|                   |                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Host bindings** | `[attr.tabindex]` (items), `(keydown)` (group)                                                      |
| **Inputs**        | `orientation`, `wrap`, `activeIndex`                                                                |
| **Complexity**    | High — parent-child coordination, keyboard handling, disabled item skipping, document-order sorting |
| **Composes into** | Tabs, menus, radio groups, toolbars, listboxes, tree views                                          |

---

### 9. AtomClickOutside

Detects pointer events outside the host element boundary and emits a dismissal event.

**Found in:** Jeremy's repos (6+ usages — dropdown, dialog, menu, tooltip, combobox, select), CDK overlay (backdrop click), PrimeNG overlay, spartan-ng/ng-primitives (per-component click-outside)

```ts
@Directive({
  selector: '[atomClickOutside]',
})
export class AtomClickOutside {
  readonly clickOutside = output<PointerEvent>({alias: 'atomClickOutside'});
  readonly disabled = model(false, {alias: 'atomClickOutsideDisabled'});
  // document-level pointerdown listener + host contains() check
}
```

|                   |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **Host bindings** | None (document-level listener)                                      |
| **Inputs**        | `atomClickOutsideDisabled: boolean`                                 |
| **Outputs**       | `atomClickOutside: PointerEvent`                                    |
| **Complexity**    | Low                                                                 |
| **Composes into** | Dropdowns, popovers, menus, date pickers, color pickers, comboboxes |

---

### 10. AtomFocusTrap

Traps Tab/Shift+Tab focus within the host element. Essential for modal accessibility.

**Found in:** Jeremy's repos (5+ usages), CDK `CdkTrapFocus`, PrimeNG `pFocusTrap`, ng-primitives `NgpFocusTrap`

|                   |                                                                 |
| ----------------- | --------------------------------------------------------------- |
| **Selector**      | `[atomFocusTrap]`                                               |
| **Host bindings** | Sentinel elements at DOM boundaries, Tab/Shift+Tab interception |
| **Inputs**        | `atomFocusTrapEnabled: boolean`, `autoFocusFirst: boolean`      |
| **Complexity**    | Medium-High                                                     |
| **Composes into** | Dialogs, modal overlays, side sheets, drawer panels             |

---

### 11. AtomAnimationState

Manages enter/exit transition data attributes for CSS-driven animations, coordinating state with `transitionend`/`animationend`.

**Found in:** Jeremy's repos (5+ usages — `data-starting-style`, `data-ending-style`), ng-primitives (`data-enter`, `data-exit`), Angular Material (animation triggers)

|                   |                                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| **Selector**      | `[atomAnimationState]`                                                   |
| **Host bindings** | `[attr.data-state]` = `'entering' \| 'entered' \| 'exiting' \| 'exited'` |
| **Inputs**        | `animationState: 'enter' \| 'exit'`                                      |
| **Outputs**       | `animationDone: 'entered' \| 'exited'`                                   |
| **Complexity**    | Medium-High                                                              |
| **Composes into** | Dialogs, popovers, toasts, tooltips, accordions, collapsibles            |

---

### 12. AtomResize

Wraps `ResizeObserver` on the host element, emitting dimension changes.

**Found in:** Jeremy's repos (5+ usages), CDK `SharedResizeObserver`, ng-primitives `NgpResize`

|                   |                                                           |
| ----------------- | --------------------------------------------------------- |
| **Selector**      | `[atomResize]`                                            |
| **Inputs**        | `resizeBox: ResizeObserverBoxOptions`                     |
| **Outputs**       | `atomResize: ResizeObserverEntry`                         |
| **Exposed**       | `size: Signal<{width: number, height: number}>`           |
| **Complexity**    | Low                                                       |
| **Composes into** | Responsive containers, overflow detection, virtual scroll |

---

### 13. AtomScrollLock

Prevents body scroll when active, with scrollbar compensation to avoid layout shift.

**Found in:** CDK `BlockScrollStrategy`, spartan-ng (via CDK overlay)

|                   |                                               |
| ----------------- | --------------------------------------------- |
| **Selector**      | `[atomScrollLock]`                            |
| **Inputs**        | `atomScrollLockEnabled: boolean`              |
| **Complexity**    | Medium                                        |
| **Composes into** | Dialogs, drawers, mobile menus, bottom sheets |

---

### 14. AtomLongPress

Detects press-and-hold gestures, emitting after a configurable duration threshold.

**Found in:** CDK drag (`dragStartDelay`), ng-primitives

|                   |                                                                |
| ----------------- | -------------------------------------------------------------- |
| **Selector**      | `[atomLongPress]`                                              |
| **Inputs**        | `longPressDuration: number` (ms, default 500)                  |
| **Outputs**       | `atomLongPress: PointerEvent`                                  |
| **Complexity**    | Low-Medium                                                     |
| **Composes into** | Context menus, mobile actions, drag initiation, selection mode |

---

### 15. AtomLiveAnnouncer

Manages an `aria-live` region for screen reader announcements.

**Found in:** CDK `LiveAnnouncer`

|                   |                                                    |
| ----------------- | -------------------------------------------------- |
| **Selector**      | `[atomLiveAnnouncer]`                              |
| **Host bindings** | `[attr.aria-live]`, `[attr.aria-atomic]`           |
| **Inputs**        | `politeness: 'polite' \| 'assertive'`              |
| **Exposed**       | `announce(message: string): void`                  |
| **Complexity**    | Simple                                             |
| **Composes into** | Toasts, snackbars, form validation, loading states |

---

### 16. AtomTypeahead

Buffers keyboard character input over a timeout window to match items by text content.

**Found in:** Jeremy's repos (5+ usages), CDK `ListKeyManager.withTypeAhead()`

|                   |                                                      |
| ----------------- | ---------------------------------------------------- |
| **Selector**      | `[atomTypeahead]`                                    |
| **Inputs**        | `typeaheadDebounce: number` (ms)                     |
| **Exposed**       | `buffer: Signal<string>`                             |
| **Complexity**    | Medium                                               |
| **Composes into** | Selects, listboxes, menus, comboboxes                |
| **Note**          | May be better as a utility function than a directive |

---

### 17. AtomFocus

Basic focus/blur tracking with `data-focus` attribute. Simpler companion to AtomFocusVisible.

**Found in:** ng-primitives (`ngpFocus`)

|                   |                                                                              |
| ----------------- | ---------------------------------------------------------------------------- |
| **Selector**      | `[atomFocus]`                                                                |
| **Host bindings** | `[attr.data-focus]`, `(focus)`, `(blur)`                                     |
| **Exposed**       | `isFocused: Signal<boolean>`                                                 |
| **Complexity**    | Simple                                                                       |
| **Note**          | Partially redundant with AtomFocusVisible — consider whether both are needed |

---

### 18. AtomFormField

Propagates form validation state (valid, invalid, touched, dirty) as data attributes for CSS styling.

**Found in:** ng-primitives (`NgpFormField` — repeats 7 data attributes across 5 child directives = 35 bindings)

|                   |                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **Selector**      | `[atomFormField]`                                                                                              |
| **Host bindings** | `[attr.data-valid]`, `[attr.data-invalid]`, `[attr.data-touched]`, `[attr.data-dirty]`, `[attr.data-pristine]` |
| **Complexity**    | Medium                                                                                                         |
| **Composes into** | All form input components, labels, descriptions, error messages                                                |

---

### 19. AtomAutofill

Detects browser autofill via the `:-webkit-autofill` animation trick.

**Found in:** ng-primitives (`NgpAutofill`)

|                   |                                                     |
| ----------------- | --------------------------------------------------- |
| **Selector**      | `[atomAutofill]`                                    |
| **Host bindings** | `[attr.data-autofill]`, `(animationstart)` listener |
| **Exposed**       | `isAutofilled: Signal<boolean>`                     |
| **Complexity**    | Simple                                              |
| **Composes into** | Text inputs, password fields, floating label forms  |

---

### 20. AtomTooltipDelay

Manages configurable show/hide delays with warmup period for tooltip hover groups.

**Found in:** Angular Material (`matTooltipShowDelay`, `matTooltipHideDelay`), PrimeNG tooltip

|                   |                                          |
| ----------------- | ---------------------------------------- |
| **Selector**      | `[atomTooltipDelay]`                     |
| **Inputs**        | `showDelay: number`, `hideDelay: number` |
| **Outputs**       | `delayedShow`, `delayedHide`             |
| **Complexity**    | Simple                                   |
| **Composes into** | Tooltips, popovers                       |

---

### 21. AtomAutoDismiss

Auto-close timer with optional pause-on-hover.

**Found in:** CDK `MatSnackBar.duration`, PrimeNG toast `life`

|                   |                                             |
| ----------------- | ------------------------------------------- |
| **Selector**      | `[atomAutoDismiss]`                         |
| **Inputs**        | `duration: number`, `pauseOnHover: boolean` |
| **Outputs**       | `dismissed`                                 |
| **Complexity**    | Simple                                      |
| **Composes into** | Toasts, snackbars, banners, notifications   |

---

### 22. AtomMove

Tracks pointer drag/move interactions for slider-like components.

**Found in:** ng-primitives (`NgpMove`)

|                   |                                                                   |
| ----------------- | ----------------------------------------------------------------- |
| **Selector**      | `[atomMove]`                                                      |
| **Outputs**       | `moveStart`, `move` (deltaX, deltaY), `moveEnd`                   |
| **Complexity**    | Medium                                                            |
| **Composes into** | Sliders, range inputs, color pickers, splitters, resizable panels |

---

### 23. AtomRipple

Material Design ink ripple effect on pointer interaction.

**Found in:** Angular Material `MatRipple`, PrimeNG `pRipple`

|                   |                                                                                   |
| ----------------- | --------------------------------------------------------------------------------- |
| **Selector**      | `[atomRipple]`                                                                    |
| **Inputs**        | `rippleColor`, `rippleDisabled`, `rippleCentered`                                 |
| **Complexity**    | High                                                                              |
| **Composes into** | Buttons, list items (Material Design specific)                                    |
| **Note**          | Highly opinionated — CDK already provides a good implementation. Lowest priority. |

---

## Comparison Sort Log

50 pairwise comparisons were performed. Key decisions:

1. **AtomOpenClose** ranked #1 despite lower source count (2) because its 30+ usages across Jeremy's repos dwarfs all other candidates. Every openable/closable component needs it.
2. **AtomOrientation** beat **AtomFocusVisible** (both 15+ usages) on simplicity — Low vs Medium complexity. The atomic principle favors simpler atoms.
3. **AtomEscapeKey** placed above **AtomDisabled** despite narrower scope because it has more raw usages (15+ vs 10+) and is simpler.
4. **AtomRovingFocus** placed #8 despite High complexity because it's the only solution for list/menu keyboard navigation — critical accessibility with no simple alternative.
5. **AtomTypeahead** placed low (#16) because one source questioned whether it should be a directive at all vs a utility function.
6. **AtomRipple** placed last (#23) as it's design-system-specific and CDK already provides `MatRipple`.
7. **AtomFocus** (#17) is partially redundant with **AtomFocusVisible** (#3) — may not be needed as a separate atom.
