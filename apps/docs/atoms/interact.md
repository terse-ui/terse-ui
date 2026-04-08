# Interact

Manage disabled state, tabindex, and activation blocking on any interactive element.

## Why use this atom?

- Unified disabled handling for native and non-native elements
- **Hard disable**: native `disabled` attr, `tabindex=-1`, removed from tab order
- **Soft disable**: `aria-disabled`, keeps tabindex, blocks Enter/Space/click but allows arrow keys
- `data-disabled="hard"` or `data-disabled="soft"` for CSS targeting
- Click blocking via capture-phase listener — fires before template `(click)` handlers
- Keyboard suppression only blocks activation keys (Enter/Space), not navigation keys

## Import

```ts
import {AtomInteract} from '@terse-ui/atoms/interact';
```

## Usage

### Hard disable (default)

```html
<button atomInteract [disabled]="loading()">Save</button>
```

On native elements, sets the native `disabled` attribute. On non-native elements (`<div>`, `<span>`, `<a>`), sets `aria-disabled="true"` and `tabindex="-1"`.

### Soft disable (keeps focus)

```html
<button atomInteract [disabled]="loading()" [disabledInteractive]="true">Save</button>
```

The element stays focusable and in the tab order. Uses `aria-disabled` instead of native `disabled`. Click and Enter/Space are blocked, but arrow keys, Escape, Home, End, and Tab pass through — so parent containers (menus, listboxes, toolbars) can still navigate through soft-disabled items.

This follows the [APG guidance on focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols).

### As a host directive

```ts
@Directive({
  selector: '[protoButton]',
  hostDirectives: [
    {directive: AtomInteract, inputs: ['disabled', 'disabledInteractive', 'tabIndex']},
  ],
})
export class ProtoButton {}
```

## Styling

```css
[atomInteract][data-disabled="hard"] {
  opacity: 0.5;
  pointer-events: none;
}

[atomInteract][data-disabled="soft"] {
  opacity: 0.7;
  cursor: not-allowed;
}
```

## Loading state pattern

```html
<button
  atomInteract
  [disabled]="isLoading()"
  [disabledInteractive]="isLoading()"
>
  {{ isLoading() ? 'Loading...' : 'Submit' }}
</button>
```

When loading starts, the button becomes soft-disabled — keyboard users keep their focus position. When loading finishes, the button re-enables without moving focus.

## API Reference

<!-- api-ref:atoms/interact -->
