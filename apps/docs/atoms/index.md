# Atoms

Atoms are single-responsibility Angular host directives. Each atom manages exactly one concern — identity, hover state, or anchor positioning. They attach to any element and compose freely thanks to Angular 22's host directive de-duplication.

## Available Atoms

| Atom | Package | Description |
| --- | --- | --- |
| [AtomId](/atoms/id) | `@terse-ui/atoms` | Generates and applies a unique `id` attribute |
| [AtomHover](/atoms/hoverable) | `@terse-ui/atoms/hover` | Tracks pointer hover state with `data-hover` attribute |
| [AtomAnchor](/atoms/anchor) | `@terse-ui/atoms/anchor` | Sets CSS `anchor-name` for anchor positioning |
| [AtomAnchored](/atoms/anchor) | `@terse-ui/atoms/anchor` | Positions an element relative to an anchor |
| [AtomOpenClose](/atoms/open-close) | `@terse-ui/atoms/open-close` | Manages `data-open` / `data-closed` and `aria-expanded` for toggleable elements |
| [AtomOrientation](/atoms/orientation) | `@terse-ui/atoms/orientation` | Sets `data-orientation` and `aria-orientation` for directional layouts |
| [AtomDisabled](/atoms/disabled) | `@terse-ui/atoms/disabled` | Unified disabled state with `data-disabled` and `aria-disabled` |
| [AtomEscapeKey](/atoms/escape-key) | `@terse-ui/atoms/escape-key` | Listens for Escape key and emits a dismissal event |
| [AtomClickOutside](/atoms/click-outside) | `@terse-ui/atoms/click-outside` | Detects pointer events outside the host element |
| [AtomIntersect](/atoms/intersect) | `@terse-ui/atoms/intersect` | Wraps `IntersectionObserver` with signals and data attributes |
| [AtomClass](/atoms/classes) | `@terse-ui/atoms/classes` | Composable class merging from multiple sources with pluggable reducer |
| [AtomFocusVisible](/atoms/focus-visible) | `@terse-ui/atoms/focus-visible` | Tracks keyboard-triggered focus with `data-focus-visible` attribute |
| [AtomPress](/atoms/press) | `@terse-ui/atoms/press` | Tracks pointer and keyboard press state with `data-press` attribute |
| [AtomFocusTrap](/atoms/focus-trap) | `@terse-ui/atoms/focus-trap` | Traps keyboard focus within the host element via Tab wrapping |
| [AtomRovingFocusGroup](/atoms/roving-focus) | `@terse-ui/atoms/roving-focus` | Arrow-key navigation and roving tabindex across focusable items |
| [AtomRovingFocusItem](/atoms/roving-focus) | `@terse-ui/atoms/roving-focus` | Item within a roving focus group with managed tabindex |

## How Atoms Compose

Atoms are designed to be used as `hostDirectives` in higher-level components and directives:

```ts
@Directive({
  selector: '[myTooltipTrigger]',
  hostDirectives: [AtomId, AtomHover, AtomAnchor],
})
export class MyTooltipTrigger { }
```

Angular de-duplicates host directives automatically. If multiple parents include the same atom, only one instance is created per host element. This is what makes atomic composition practical — atoms stack without conflict.

Atoms can also be used standalone on any element:

```html
<div atomId atomHover>...</div>
```

See [Why Terse UI?](/guide/why-terse-ui) for the full story on how host directive de-duplication enables this architecture.
