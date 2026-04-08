# Focus

Track focus state on any element with both general focus and keyboard-only focus detection.

## Why use this atom?

- Distinguishes any focus (`data-focus`) from keyboard focus (`data-focus-visible`)
- Programmatic focus control via writable `isFocused` signal — `isFocused.set(true)` focuses the element
- Powered by signality's `elementFocus()` with automatic SSR safety and cleanup
- Native `:focus-visible` matching for keyboard detection — no CDK dependency

## Import

```ts
import {AtomFocus} from '@terse-ui/atoms/focus';
```

## Usage

```html
<button atomFocus>Save</button>
```

When the element receives any focus, `data-focus` is set. When focus is keyboard-triggered, `data-focus-visible` is also set. Both are removed on blur.

### Template reference

```html
<button atomFocus #f="atomFocus">
  {{ f.isFocusVisible() ? 'Keyboard focused' : f.isFocused() ? 'Focused' : 'Not focused' }}
</button>
```

### Programmatic focus

```ts
@Directive({
  selector: '[autoFocusOnOpen]',
  hostDirectives: [AtomFocus],
})
export class AutoFocusOnOpen {
  readonly #focus = inject(AtomFocus);

  setFocus() {
    this.#focus.isFocused.set(true); // focuses the element
  }

  removeFocus() {
    this.#focus.isFocused.set(false); // blurs the element
  }
}
```

## Styling

```css
[atomFocus][data-focus] {
  /* Any focus (mouse, keyboard, programmatic) */
}

[atomFocus][data-focus-visible] {
  /* Keyboard focus only — use for focus rings */
  outline: 2px solid var(--ring-color);
  outline-offset: 2px;
}
```

## API Reference

<!-- api-ref:atoms/focus -->
