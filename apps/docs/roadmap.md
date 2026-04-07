# Roadmap

Terse UI is building toward a complete pipeline: from atomic behaviors to fully styled, auditable components you own. Here's where we're headed.

## Now: Atoms + Protos

The foundation. Atomic host directives that compose into headless UI components via Angular 22's de-duplicated host directives.

| Layer | Status | Description |
| --- | --- | --- |
| `@terse-ui/core` | Stable | Utilities, ID generation, options builder, host helpers |
| `@terse-ui/atoms` | Active | Atomic host directives (Id, Hover, Anchor, Disabled, OpenClose, Orientation, EscapeKey, ClickOutside, Intersect, Classes) |
| `@terse-ui/protos` | Active | Headless components composed from atoms (Button, more coming) |

### Atoms in progress

- **AtomFocusVisible** — keyboard vs mouse focus origin detection
- **AtomPress** — pointer/keyboard active state tracking
- **AtomRovingFocus** — arrow key navigation for menus, tabs, radio groups
- **AtomFocusTrap** — Tab/Shift+Tab containment for modals
- **AtomScrollLock** — body scroll prevention for overlays
- **AtomAnimationState** — CSS enter/exit transition coordination

### Protos in progress

- **ProtoDialog** — modal dialog with focus trap, escape dismiss, click-outside
- **ProtoTooltip** — anchor-positioned tooltip with hover/focus triggers and delay
- **ProtoMenu** — dropdown menu with roving focus and typeahead
- **ProtoAccordion** — collapsible panels with keyboard navigation
- **ProtoTabs** — tabbed interface with roving tabindex
- **ProtoSelect** — custom select with listbox pattern

## Next: Theme Packs

Protos expose `data-*` attributes for every state: `data-hover`, `data-open`, `data-disabled`, `data-pressed`, `data-focus-visible`. A "theme" is just a CSS file that targets these attributes. No JavaScript. No Angular code. Just CSS.

```css
/* Example: minimal theme for ProtoButton */
[protoButton] {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: var(--terse-primary);
  color: var(--terse-on-primary);
  transition: background 150ms ease;
}

[protoButton][data-hover] {
  background: var(--terse-primary-hover);
}

[protoButton][data-pressed] {
  background: var(--terse-primary-active);
}

[protoButton][data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Theme packs ship as plain CSS targeting the proto `data-*` contract:

| Theme | Description |
| --- | --- |
| `@terse-ui/theme-minimal` | Clean, neutral defaults |
| `@terse-ui/theme-tailwind` | Tailwind-native utility classes via AtomClass |
| `@terse-ui/theme-high-contrast` | WCAG AAA contrast ratios |

No component generation. No runtime cost. Swap themes by changing a CSS import.

## Then: Forge

The third layer. Not a package — a pipeline.

**`@terse-ui/forge`** is a CLI that assembles atoms, protos, theme CSS, tests, and playground pages into components you own. Inspired by shadcn/ui's distribution model: source files copied into your project, not hidden in `node_modules`.

```bash
npx terse forge button --theme=minimal
npx terse forge dialog --theme=tailwind --a11y=strict
npx terse forge menu --theme=high-contrast
```

### What Forge generates

For `npx terse forge button --theme=minimal`:

```
src/components/button/
  button.component.ts     # ProtoButton + theme CSS composed
  button.component.css    # Themed styles targeting data-* attributes
  button.component.spec.ts # Tests
  button.stories.ts       # Playground page (Analog)
```

You own every file. Diff it, modify it, audit it. No black box.

### Why this matters for enterprise

Angular in enterprise means auditable, customizable, compliant. The shadcn model — where you own the source and can trace every behavior — is exactly what teams need when leadership asks "can we audit the accessibility of our component library?"

Forge doesn't just copy files. Different flags produce different outputs:

| Flag | Effect |
| --- | --- |
| `--theme=<name>` | Which theme CSS to include |
| `--a11y=strict` | Include WCAG compliance annotations in source |
| `--tests` | Generate test file with accessibility assertions |
| `--playground` | Generate Analog playground page with state knobs |

### Compliance matrix

Each proto maps to its WAI-ARIA pattern, which WCAG criteria it satisfies, and what the consumer is still responsible for. This turns the library from "components" into "auditable accessibility infrastructure."

| Proto | WAI-ARIA Pattern | WCAG Satisfied | Consumer Responsibility |
| --- | --- | --- | --- |
| ProtoButton | [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | 2.1.1, 4.1.2 | Color contrast, focus-visible styling |
| ProtoDialog | [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | 2.1.1, 2.1.2, 2.4.3 | Trigger labeling, dialog content |
| ProtoMenu | [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) | 2.1.1, 4.1.2 | Menu item labels, icons |
| ProtoTabs | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | 2.1.1, 4.1.2 | Tab panel content, focus styling |

### Component catalog

The library ships a component catalog that runs as an Analog app. Each proto gets a live playground page with:

- Knobs for every `data-*` state
- Inline accessibility audits (aXe integration)
- A "copy theme CSS" button for each variant
- Live preview of the component in every theme

Angular-native. Zero config. Built for the headless-to-styled workflow.

---

## Timeline

| Phase | Target | Status |
| --- | --- | --- |
| **Atoms** | Core behavioral primitives | In progress |
| **Protos** | Headless UI components | In progress |
| **Theme Packs** | CSS-only styling contracts | Planned |
| **Forge CLI** | Component generation pipeline | Planned |
| **Catalog** | Analog-powered component playground | Planned |
| **Compliance** | WCAG/ARIA mapping per proto | Planned |
