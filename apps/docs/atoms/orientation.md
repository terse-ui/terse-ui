# Orientation

Set `data-orientation` and `aria-orientation` for components with horizontal or vertical layout variants.

## Why use this atom?

- Consistent orientation attribute binding across tabs, separators, sliders, toolbars, and menus
- Both `data-orientation` for CSS styling and `aria-orientation` for assistive technology
- Two-way binding via model input
- Composes into any component that has a directional layout

## Import

```ts
import {AtomOrientation} from '@terse-ui/atoms/orientation';
```

## Usage

```html
<div atomOrientation role="tablist">
  <button role="tab">Tab 1</button>
  <button role="tab">Tab 2</button>
</div>
```

By default, orientation is `'horizontal'`. Set it to `'vertical'` for stacked layouts:

```html
<div atomOrientation="vertical" role="tablist">
  <button role="tab">Tab 1</button>
  <button role="tab">Tab 2</button>
</div>
```

### As a Host Directive

```ts
@Directive({
  selector: '[myTabList]',
  hostDirectives: [{directive: AtomOrientation, inputs: ['atomOrientation']}],
})
export class MyTabList {
  readonly #orientation = inject(AtomOrientation);
}
```

## Styling

```css
[data-orientation="horizontal"] {
  display: flex;
  flex-direction: row;
}

[data-orientation="vertical"] {
  display: flex;
  flex-direction: column;
}
```

## API Reference

<!-- api-ref:atoms/orientation -->
