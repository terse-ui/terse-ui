# Press

Track pointer and keyboard press state on any element.

## Why use this atom?

- Unified press tracking for pointer (mouse, touch, pen) and keyboard (Enter, Space)
- Uses `pointermove` instead of `pointerleave` for iOS Safari compatibility
- Tracks active key to prevent mismatched keyup releases
- Skips editable targets (inputs, textareas, contenteditable) for keyboard press
- Emits `pressStart` and `pressEnd` events for side effects
- Configurable long-press via `delay` and `distanceThreshold` inputs

## Import

```ts
import {AtomPress} from '@terse-ui/atoms/press';
```

## Usage

```html
<button atomPress>Hold me</button>
```

When the element is pressed via pointer or keyboard, `data-press` is set. It is removed when the press ends.

### Events

```html
<button atomPress (atomPressStart)="onStart()" (atomPressEnd)="onEnd()">
  Press me
</button>
```

### Template reference

```html
<button atomPress #p="atomPress">
  {{ p.isPressed() ? 'Pressing...' : 'Press me' }}
</button>
```

### Disabling

```html
<button atomPress [atomPressDisabled]="true">No press tracking</button>
```

### As a host directive

```ts
@Directive({
  selector: '[myButton]',
  hostDirectives: [AtomPress, AtomHover, AtomFocus],
})
export class MyButton {}
```

## Styling

```css
[atomPress][data-press] {
  transform: scale(0.98);
  opacity: 0.9;
}
```

## Pointer handling

On `pointerdown`, the directive attaches global `pointerup`, `pointercancel`, and `pointermove` listeners on the document. The `pointermove` handler uses `getBoundingClientRect()` to detect when the pointer exits the element bounds — this is more reliable than `pointerleave` on iOS Safari. All global listeners are cleaned up on release and on destroy.

## Long press

Enable long-press detection by setting a `delay` in milliseconds:

```html
<button atomPress [atomPressDelay]="500" (atomPressLongPress)="onLongPress($event)">
  Hold me
</button>
```

The `longPress` output fires after the delay elapses if the pointer hasn't moved beyond `distanceThreshold` (default 10px). Set `distanceThreshold` to `false` to disable movement cancellation:

```html
<button
  atomPress
  [atomPressDelay]="800"
  [atomPressDistanceThreshold]="false"
  (atomPressLongPress)="showContextMenu($event)"
>
  Long press for options
</button>
```

When `delay` is 0 (the default), long-press detection is inactive and no `longPress` events are emitted. The instant press behavior (`isPressed`, `data-press`, `pressStart`, `pressEnd`) always works regardless of the delay setting.

## Keyboard handling

Enter and Space trigger press on `keydown`. The directive tracks the active key to prevent a mismatched `keyup` (e.g., pressing Enter then releasing Space) from ending the press. Press is also reset on `blur`. Editable targets (text inputs, textareas, contenteditable) are ignored to avoid interfering with typing.

## API Reference

<!-- api-ref:atoms/press -->
