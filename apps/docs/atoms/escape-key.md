# Escape Key

Listen for the Escape key and emit an event, with support for disabling the listener.

## Why use this atom?

- Every overlay component (dialog, tooltip, menu, popover, combobox) needs Escape key dismissal
- Avoids duplicating `(keydown.escape)` handlers across components
- Disableable to suppress the listener when the overlay is inactive
- Emits the raw `KeyboardEvent` so consumers can call `preventDefault()` or `stopPropagation()` for nested overlay scenarios

## Import

```ts
import {AtomEscapeKey} from '@terse-ui/atoms/escape-key';
```

## Usage

```html
<div atomEscapeKey (atomEscapeKey)="close()">
  Press Escape to dismiss
</div>
```

### Disabling

Suppress the Escape key listener when the overlay is not visible:

```html
<div
  atomEscapeKey
  [atomEscapeKeyDisabled]="!isOpen()"
  (atomEscapeKey)="close()"
>
  Overlay content
</div>
```

### As a Host Directive

```ts
@Directive({
  selector: '[myDialog]',
  hostDirectives: [
    {directive: AtomEscapeKey, outputs: ['atomEscapeKey']},
  ],
})
export class MyDialog {
  readonly #escapeKey = inject(AtomEscapeKey);
}
```

### Nested Overlays

For nested overlays, use `stopPropagation()` to prevent the parent from also closing:

```html
<div atomEscapeKey (atomEscapeKey)="closeParent()">
  <div atomEscapeKey (atomEscapeKey)="closeChild(); $event.stopPropagation()">
    Nested overlay
  </div>
</div>
```

## API Reference

<!-- api-ref:atoms/escape-key -->
