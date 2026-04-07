# Click Outside

Detect pointer events outside the host element and emit a dismissal event.

## Why use this atom?

- Every dropdown, dialog, menu, and popover needs click-outside-to-close behavior
- Uses `pointerdown` on the document for reliable cross-device detection
- Disableable to suppress the listener when the component is inactive
- Replaces fragile CSS `:focus-within` hacks and manual document click listeners

## Import

```ts
import {AtomClickOutside} from '@terse-ui/atoms/click-outside';
```

## Usage

```html
<div atomClickOutside (atomClickOutside)="close()">
  Click outside this element to close
</div>
```

### Disabling

Suppress the listener when the dropdown is not open:

```html
<div
  atomClickOutside
  [atomClickOutsideDisabled]="!isOpen()"
  (atomClickOutside)="close()"
>
  Dropdown content
</div>
```

### As a Host Directive

```ts
@Directive({
  selector: '[myDropdown]',
  hostDirectives: [
    {directive: AtomClickOutside, outputs: ['atomClickOutside']},
  ],
})
export class MyDropdown {
  readonly #clickOutside = inject(AtomClickOutside);
}
```

### Combined with Escape Key

Click-outside and Escape key are a natural pair for dismissable overlays:

```html
<div
  atomClickOutside
  atomEscapeKey
  (atomClickOutside)="close()"
  (atomEscapeKey)="close()"
>
  Dismissable overlay
</div>
```

## API Reference

### AtomClickOutside

| | |
| --- | --- |
| **Selector** | `[atomClickOutside]` |
| **Exported as** | `atomClickOutside` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `atomClickOutsideDisabled` | `boolean` | `false` | Suppress the click-outside listener |

#### Outputs

| Output | Type | Description |
| --- | --- | --- |
| `atomClickOutside` | `PointerEvent` | Emitted when a pointer event occurs outside the host element |
