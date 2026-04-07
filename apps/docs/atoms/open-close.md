# Open Close

Manage open/closed state with `data-open`, `data-closed`, and `aria-expanded` on any toggleable element.

## Why use this atom?

- Eliminates the most repeated host binding pattern in Angular UI libraries (30+ usages across dialogs, dropdowns, accordions, tooltips, menus, sheets)
- Consistent `data-open` / `data-closed` attributes for CSS-only state styling
- Automatic `aria-expanded` for screen reader accessibility
- Two-way binding via model input for parent-controlled state

## Import

```ts
import {AtomOpenClose} from '@terse-ui/atoms/open-close';
```

## Usage

```html
<details atomOpenClose #oc="atomOpenClose">
  <summary (click)="oc.atomOpenClose.set(!oc.atomOpenClose())">Toggle</summary>
  <p>Content</p>
</details>
```

When `atomOpenClose` is `true`, the element gets `data-open` and `aria-expanded="true"`. When `false`, it gets `data-closed` and `aria-expanded="false"`.

### Two-Way Binding

Control the state from a parent component:

```html
<div [(atomOpenClose)]="isOpen">...</div>
```

### As a Host Directive

```ts
@Directive({
  selector: '[myAccordionPanel]',
  hostDirectives: [{directive: AtomOpenClose, inputs: ['atomOpenClose'], outputs: ['atomOpenCloseChange']}],
})
export class MyAccordionPanel {
  readonly #openClose = inject(AtomOpenClose);
}
```

## Styling

```css
[data-open] {
  /* Styles when open */
}

[data-closed] {
  /* Styles when closed */
}

/* Animate open/close transitions */
[atomOpenClose] {
  transition: opacity 200ms ease;
}
[data-closed] {
  opacity: 0;
}
```

## API Reference

### AtomOpenClose

| | |
| --- | --- |
| **Selector** | `[atomOpenClose]` |
| **Exported as** | `atomOpenClose` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `atomOpenClose` | `boolean` | `false` | Whether the element is open (model, two-way bindable) |

#### Data Attributes

| Attribute | Description |
| --- | --- |
| `data-open` | Present when open. Absent otherwise. |
| `data-closed` | Present when closed. Absent otherwise. |

#### Host Bindings

| Binding | Description |
| --- | --- |
| `[attr.aria-expanded]` | Reflects the open state for assistive technology |
