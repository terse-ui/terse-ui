# Button

Enhance any element with accessible button behavior, including keyboard support, interaction states, and proper ARIA semantics.

## Why use this button proto?

The browser's native `<button>` element works great, but sometimes you need:

- **Consistent interaction states** across hover, press, and focus for styling
- **Anchors** with `href`/`routerLink` that need the accessibility and visual treatment of a button
- **Custom button components** with button accessibility and custom styling
- **Loading states** that keep focus on the button while it's temporarily disabled
- **Disabled tooltips** that explain why a button is disabled

This primitive handles all of that while following the [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

## Import

```ts
import {ProtoButton} from '@terse-ui/protos/button';
```

## Accessibility Features

ProtoButton implements the [WAI-ARIA Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/):

| Feature           | Native `<button>`  | Non-native elements                                           |
| ----------------- | ------------------ | ------------------------------------------------------------- |
| **Role**          | Implicit           | Adds `role="button"` (in the absence of set or apparent role) |
| **Keyboard**      | Browser handles    | Enter activates immediately, Space activates on release       |
| **Disabled**      | `disabled` attr    | `aria-disabled="true"` + event blocking                       |
| **Tab order**     | `disabled` removes | `tabindex="-1"` when disabled                                 |
| **Focus visible** | `:focus-visible`   | `data-focus-visible` attribute                                |

## Examples

### Loading States

Use `disabledInteractive` for buttons that enter a loading state after being clicked.

**Why?** When a button becomes disabled, it's removed from the tab order. Keyboard users lose their focus position and have to navigate back when loading completes. `disabledInteractive` keeps focus on the button throughout the loading cycle.

<Example name="proto-button-loading" />

#### How it works

| Property                           | Behavior                                                    |
| ---------------------------------- | ----------------------------------------------------------- |
| `disabled` only                    | Uses native `disabled` attr, removed from tab order         |
| `disabled` + `disabledInteractive` | Uses `aria-disabled`, stays in tab order, blocks activation |

This follows the [APG guidance on focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols).

## Styling

These are the recommended ways to style the button across different states:

```css
[protoButton] {
  /* Base styles */
}

[protoButton][data-disabled] {
  /* Disabled (interactive or not) */
}

[protoButton]:not([data-disabled]):hover {
  /* Hovered */
}

[protoButton]:not([data-disabled]):active {
  /* Pressed */
}

[protoButton]:not([data-disabled='hard']):focus-visible {
  /* Focus visible (keep focus when soft disabled) */
}
```

## API Reference

<!-- api-ref:protos/button -->

## Accessibility

Prefer native `<button>` elements for built-in browser accessibility. Native buttons receive the `disabled` attribute, which removes them from the tab order. Enabling `disabledInteractive` switches to `aria-disabled="true"` instead, keeping the button focusable while still blocking activation. Non-native elements always use `aria-disabled` for disabled state, and `ProtoButton` automatically adds `role="button"` and keyboard activation for them.

### Keyboard Interactions

- <kbd>Enter</kbd>: Activate the button.
- <kbd>Space</kbd>: Activate the button (on key release).
