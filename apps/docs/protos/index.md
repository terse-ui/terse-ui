# Protos

Protos are headless UI components that compose [atoms](/atoms/) via Angular's `hostDirectives`. They provide complete behavior and accessibility with zero CSS. You bring the design.

## Available Protos

| Proto | Package | Description |
| --- | --- | --- |
| [ProtoButton](/protos/button) | `@terse-ui/protos/button` | Accessible button behavior with keyboard support, disabled states, and ARIA semantics |

## How Protos Work

Each proto declares atoms in its `hostDirectives` array, inheriting their behavior automatically:

```ts
@Directive({
  selector: '[protoButton]',
  hostDirectives: [AtomId, AtomHover],
  // ...ARIA, keyboard, disabled state logic
})
export class ProtoButton { }
```

Angular 22's host directive de-duplication means there are no conflicts when multiple protos or directives share the same atoms on an element.

## Styling

All protos expose `data-*` attributes for styling. No CSS is shipped — every pixel is yours:

```css
[protoButton] { /* base */ }
[protoButton][data-disabled] { /* disabled */ }
[protoButton][data-hover] { /* hovered */ }
```

See each proto's documentation for the full list of data attributes and recommended CSS selectors.
