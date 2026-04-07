# Anchor

Position elements relative to an anchor using CSS Anchor Positioning.

## Why use these atoms?

- Declarative CSS anchor positioning without manual JavaScript calculations
- Automatic unique anchor names via `AtomAnchor`
- Configurable side, position type, and fallback strategies via `AtomAnchored`
- Built-in `position-try-fallbacks` for viewport-aware repositioning
- Foundation for tooltips, popovers, menus, and dropdowns

## Import

```ts
import {AtomAnchor, AtomAnchored} from '@terse-ui/atoms/anchor';
```

## Usage

Pair an anchor element with a positioned element:

```html
<button atomAnchor #anchor="atomAnchor">Trigger</button>

<div [atomAnchored]="anchor" atomAnchoredSide="bottom">
  Positioned below the button
</div>
```

`AtomAnchor` sets a unique CSS `anchor-name` on the trigger. `AtomAnchored` reads that name and applies CSS anchor positioning styles to place itself relative to the anchor.

### Implicit Anchor

If `AtomAnchored` is a child of an `AtomAnchor` element and no explicit anchor is provided, it injects the parent's anchor automatically:

```html
<div atomAnchor>
  <div atomAnchored>Anchored to parent</div>
</div>
```

### Anchor by Name

You can also pass a CSS anchor name string directly:

```html
<div [atomAnchored]="'--my-anchor'">Anchored by name</div>
```

## Configuration

Override defaults with `provideAnchorOpts`:

```ts
import {provideAnchorOpts} from '@terse-ui/atoms/anchor';

@Component({
  providers: [provideAnchorOpts({side: 'top', margin: 8})],
})
export class MyComponent {}
```

Options are deep-merged and inherited through the injector hierarchy.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Which side of the anchor to position on |
| `position` | `'fixed' \| 'absolute'` | `'fixed'` | CSS `position` value |
| `positionTryFallbacks` | `string[]` | `['flip-block', 'flip-inline', 'flip-block flip-inline']` | CSS `position-try-fallbacks` strategies |
| `margin` | `string \| number` | `0` | Margin from the anchor |

## API Reference

<!-- api-ref:atoms/anchor -->
