# Hoverable

Track pointer hover state on any element, with proper touch device handling.

## Why use this atom?

- Reliable hover detection across pointer and mouse events
- Prevents phantom hover on touch devices by ignoring emulated mouse events after touch
- Exposes `data-hover` attribute for CSS-only styling
- Provides `isHovered` signal for programmatic access
- Can be disabled to suppress hover tracking

## Import

```ts
import {AtomHover} from '@terse-ui/atoms/hover';
```

## Usage

```html
<button atomHover>Hover me</button>
```

When the pointer enters the element, `data-hover` is set. When it leaves, the attribute is removed.

### Template Reference

Use `exportAs` to access the hover state in templates:

```html
<button atomHover #hover="atomHover">
  {{ hover.isHovered() ? 'Hovered!' : 'Hover me' }}
</button>
```

### Disabling

Suppress hover tracking by setting `atomHoverDisabled`:

```html
<button atomHover [atomHoverDisabled]="true">No hover tracking</button>
```

When disabled, `data-hover` is never applied and `isHovered` remains `false`.

## Styling

```css
[atomHover] {
  /* Base styles */
}

[atomHover][data-hover] {
  /* Hovered state */
}
```

The `data-hover` attribute is only present when the element is hovered and hover tracking is enabled.

## Touch Handling

`AtomHover` uses a global `PointerEvent` listener to detect touch interactions. After a `touchend` or touch-type `pointerup`, emulated mouse events are ignored for 50ms. This prevents the common issue where touch devices briefly trigger hover states after a tap.

## API Reference

<!-- api-ref:atoms/hover -->
