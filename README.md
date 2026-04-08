# Terse UI

**Behavior without opinions.** Accessible, headless Angular UI primitives built on directive composition. You bring the design.

## Why Terse UI?

Angular 22 introduced de-duplicated host directives. Before this, composing multiple directives that shared a common child directive would throw `NG0309`. Building small, reusable behavioral primitives was impractical — you'd hit duplication errors the moment you tried to compose them.

That limitation is gone. Terse UI is built entirely on this capability.

**Atoms** are single-responsibility host directives — one generates an ID, another tracks hover state, another handles CSS anchor positioning. Each does exactly one thing.

**Protos** compose atoms into headless UI components via `hostDirectives`. A proto like `ProtoButton` gets accessible keyboard handling, ARIA semantics, and interaction states — all from atoms stacking without conflict.

No CSS shipped. No design opinions. Full WAI-ARIA compliance. Just behavior.

## Quick Start

```bash
pnpm add @terse-ui/core @terse-ui/atoms @terse-ui/protos
```

```ts
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ProtoButton} from '@terse-ui/protos/button';

@Component({
  selector: 'app-save',
  imports: [ProtoButton],
  template: `<button protoButton (click)="save()">Save</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveComponent {
  save() {
    /* ... */
  }
}
```

`ProtoButton` adds `role="button"` (on non-native elements), keyboard activation, disabled state management, and focus handling — automatically.

## Architecture

```
@terse-ui/core          Utilities, ID generation, options builder, host helpers
    |
@terse-ui/atoms         Atomic host directives (AtomId, AtomHover, AtomAnchor, AtomAnchored)
    |
@terse-ui/protos        Headless UI components composed from atoms (ProtoButton, ...)
```

## Packages

| Package                               | Description                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| [`@terse-ui/core`](packages/core)     | Foundational utilities: ID generation, deep-merge, type guards, injection helpers |
| [`@terse-ui/atoms`](packages/atoms)   | Atomic host directives: identity, hover, anchor positioning                       |
| [`@terse-ui/protos`](packages/protos) | Headless UI components composed from atoms                                        |

## Links

- [Documentation](https://terse-ui.com)
- [GitHub](https://github.com/terse-ui/terse-ui)

## License

MIT
