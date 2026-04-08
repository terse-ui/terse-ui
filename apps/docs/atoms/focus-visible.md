# Focus Visible

Track keyboard-triggered focus on any element using the native `:focus-visible` heuristic.

## Why use this atom?

- Distinguishes keyboard focus from mouse/touch focus without CDK dependency
- Leverages native browser `:focus-visible` matching — no JavaScript focus origin tracking
- Exposes `data-focus-visible` attribute for CSS-only styling
- Provides `isFocusVisible` signal for programmatic access
- Can be disabled to suppress tracking

## Import

```ts
import {AtomFocusVisible} from '@terse-ui/atoms/focus-visible';
```

## Usage

```html
<button atomFocusVisible>Save</button>
```

When the element receives keyboard focus, `data-focus-visible` is set. Mouse or touch focus does not trigger it. The attribute is removed on blur.

### Template reference

```html
<button atomFocusVisible #fv="atomFocusVisible">
  {{ fv.isFocusVisible() ? 'Keyboard focused' : 'Click or tab to me' }}
</button>
```

### Disabling

```html
<button atomFocusVisible [atomFocusVisibleDisabled]="true">No focus tracking</button>
```

### As a host directive

```ts
@Component({
  selector: 'my-button',
  hostDirectives: [AtomFocusVisible],
  template: `<ng-content />`,
})
export class MyButton {}
```

## Styling

```css
[atomFocusVisible][data-focus-visible] {
  outline: 2px solid var(--ring-color);
  outline-offset: 2px;
}
```

The `data-focus-visible` attribute is only present during keyboard focus. Mouse and touch focus do not trigger it.

## How it works

On the `(focus)` event, the directive checks `element.matches(':focus-visible')`. This uses the browser's built-in heuristic to determine whether the focus was keyboard-triggered. No CDK `FocusMonitor`, no global event listeners, no origin tracking — just the platform.

## API Reference

<!-- api-ref:atoms/focus-visible -->
