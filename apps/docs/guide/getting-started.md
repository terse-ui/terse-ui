# Getting Started

## Installation

```bash
pnpm add @terse-ui/core @terse-ui/protos @terse-ui/atoms
```

## Your First Component

Add `ProtoButton` to any element for accessible button behavior:

```ts
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ProtoButton} from '@terse-ui/protos/button';

@Component({
  selector: 'app-example',
  imports: [ProtoButton],
  template: `
    <button protoButton (click)="count = count + 1">
      Clicked {{ count }} times
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  count = 0;
}
```

The rendered `<button>` gets keyboard activation, disabled state management, and proper ARIA semantics automatically. No extra configuration needed.

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
