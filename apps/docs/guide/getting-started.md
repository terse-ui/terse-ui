# Getting Started

## Installation

```bash
pnpm add @terse-ui/core @terse-ui/atoms @terse-ui/protos
```

## Your First Component

Add `AtomInteract` and `ProtoButton` as host directives to any element for accessible button behavior:

```ts
import {Directive} from '@angular/core';
import {AtomInteract} from '@terse-ui/atoms/interact';
import {ProtoButton} from '@terse-ui/protos/button';

@Directive({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: AtomInteract,
      inputs: ['disabled', 'disabledInteractive', 'tabIndex'],
    },
    {
      directive: ProtoButton,
      inputs: ['role', 'type'],
    },
  ],
})
export class AppButton {}
```

The rendered `<app-button />` gets keyboard activation, native and soft disabled state management, and proper ARIA semantics automatically. No extra configuration needed.

## Styling

Terse UI ships zero CSS. Style primitives using the `data-*` attributes they expose:

```css
[protoButton] {
  /* Base button styles */
}

[protoButton][data-disabled] {
  /* Disabled state */
}
```

See each component's docs page for the full list of data attributes available for styling.

## Next Steps

- [Why Terse UI?](/guide/why-terse-ui) — The architecture and what makes it different
- [Atoms](/atoms/) — The building blocks
- [Protos](/protos/) — Headless components composed from atoms
