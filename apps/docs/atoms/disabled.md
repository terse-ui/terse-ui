# Disabled

Unified disabled state with `data-disabled` and `aria-disabled` on any element.

## Why use this atom?

- Single source of truth for disabled state instead of scattering `data-disabled`, `aria-disabled`, and `disabled` across components
- CSS-friendly `data-disabled` attribute for styling without `:disabled` pseudo-class limitations
- Works on non-form elements where the native `disabled` attribute has no effect
- Two-way binding via model input

## Import

```ts
import {AtomDisabled} from '@terse-ui/atoms/disabled';
```

## Usage

```html
<button atomDisabled>Enabled by default</button>

<button [atomDisabled]="true">Disabled button</button>
```

When `atomDisabled` is `true`, the element gets `data-disabled` and `aria-disabled="true"`.

### Two-Way Binding

```html
<button [(atomDisabled)]="isDisabled">Toggle me</button>
```

### As a Host Directive

```ts
@Directive({
  selector: '[myMenuItem]',
  hostDirectives: [{directive: AtomDisabled, inputs: ['atomDisabled']}],
})
export class MyMenuItem {
  readonly #disabled = inject(AtomDisabled);
}
```

## Styling

```css
[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
```

::: tip Native `disabled` attribute
For native `<button>` and `<input>` elements, you may still want to bind the HTML `disabled` attribute in addition to `AtomDisabled`. The native attribute prevents form submission and removes the element from the tab order, which `aria-disabled` alone does not do.
:::

## API Reference

### AtomDisabled

| | |
| --- | --- |
| **Selector** | `[atomDisabled]` |
| **Exported as** | `atomDisabled` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `atomDisabled` | `boolean` | `false` | Whether the element is disabled (model, two-way bindable) |

#### Data Attributes

| Attribute | Description |
| --- | --- |
| `data-disabled` | Present when disabled. Absent otherwise. |

#### Host Bindings

| Binding | Description |
| --- | --- |
| `[attr.aria-disabled]` | Reflects the disabled state for assistive technology |
