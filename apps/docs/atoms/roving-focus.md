# Roving Focus

Manage arrow-key navigation and roving tabindex across a group of focusable items.

## Why use these atoms?

- Implements the [WAI-ARIA roving tabindex pattern](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex) — only the active item has `tabindex="0"`, all others have `tabindex="-1"`
- Arrow key navigation with configurable orientation (vertical or horizontal)
- Optional wrapping from last to first and vice versa
- Home/End key support to jump to first/last items
- Automatically skips disabled items during navigation
- Items self-register and unregister — no manual list management
- DOM order sorting via `compareDocumentPosition` — items don't need to be in a specific order in the template
- Foundation for tabs, menus, radio groups, toolbars, listboxes, and tree views

## Import

```ts
import {AtomRovingFocusGroup, AtomRovingFocusItem} from '@terse-ui/atoms/roving-focus';
```

## Usage

```html
<ul atomRovingFocusGroup>
  <li atomRovingFocusItem>One</li>
  <li atomRovingFocusItem>Two</li>
  <li atomRovingFocusItem>Three</li>
</ul>
```

The first item gets `tabindex="0"`. When the user presses ArrowDown, focus moves to the next item — the previous item gets `tabindex="-1"` and the new item gets `tabindex="0"`.

### Horizontal Navigation

```html
<div atomRovingFocusGroup atomRovingFocusGroupOrientation="horizontal" role="tablist">
  <button atomRovingFocusItem role="tab">Tab 1</button>
  <button atomRovingFocusItem role="tab">Tab 2</button>
  <button atomRovingFocusItem role="tab">Tab 3</button>
</div>
```

In horizontal mode, ArrowLeft/ArrowRight navigate instead of ArrowUp/ArrowDown.

### Disabled Items

```html
<ul atomRovingFocusGroup>
  <li atomRovingFocusItem>Enabled</li>
  <li atomRovingFocusItem [atomRovingFocusItemDisabled]="true">Disabled (skipped)</li>
  <li atomRovingFocusItem>Enabled</li>
</ul>
```

Disabled items are skipped during keyboard navigation and cannot be activated by click.

### As Host Directives

```ts
@Directive({
  selector: '[myTabList]',
  hostDirectives: [{
    directive: AtomRovingFocusGroup,
    inputs: ['atomRovingFocusGroupOrientation'],
  }],
})
export class MyTabList {}

@Directive({
  selector: '[myTab]',
  hostDirectives: [AtomRovingFocusItem],
})
export class MyTab {}
```

## Keyboard Interactions

- <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd>: Navigate in vertical mode
- <kbd>ArrowRight</kbd> / <kbd>ArrowLeft</kbd>: Navigate in horizontal mode
- <kbd>Home</kbd>: Focus first item
- <kbd>End</kbd>: Focus last item

## API Reference

<!-- api-ref:atoms/roving-focus -->
