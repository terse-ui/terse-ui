# Why Terse UI?

Terse UI exists because Angular 22 made something new possible: practical directive composition through host directive de-duplication.

## The Problem

Angular's `hostDirectives` let a directive or component automatically apply other directives to its host element. This is powerful for composition — a button component could pull in an ID directive, a hover directive, and a focus directive all at once.

But before Angular 22, there was a fatal limitation. If two host directives both included the same child directive, Angular threw `NG0309: duplicate directive`. This meant you couldn't build small, reusable behavioral directives and freely compose them — the moment two parents shared a dependency, everything broke.

```ts
// Before Angular 22: This would throw NG0309

@Directive({
  selector: '[tooltipTrigger]',
  hostDirectives: [AtomId, AtomHover], // AtomId here...
})
export class TooltipTrigger {}

@Directive({
  selector: '[menuTrigger]',
  hostDirectives: [AtomId, AtomHover], // ...and AtomId here too — NG0309!
})
export class MenuTrigger {}

// Using both on one element was impossible:
// <button tooltipTrigger menuTrigger>Open</button>
```

The workaround was the [`AutoHost`](/utils/host) decorator — a per-host-element singleton pattern using `WeakMap` and `__NG_ELEMENT_ID__` to manually de-duplicate instances. It worked, but it was verbose, fragile, and invisible to Angular's dependency injection. Ironically, it turned out to have [its own legitimate use-cases](/utils/host#why-not-just-use-host-directives) beyond the workaround — solving safety problems that even de-duplication doesn't address.

## The Fix

Angular 22 de-duplicates host directives automatically. If the same directive appears in multiple `hostDirectives` chains on the same element, Angular keeps one instance. No errors, no workarounds.

```ts
// Angular 22+: Just works

@Directive({
  selector: '[tooltipTrigger]',
  hostDirectives: [AtomId, AtomHover],
})
export class TooltipTrigger {}

@Directive({
  selector: '[menuTrigger]',
  hostDirectives: [AtomId, AtomHover],
})
export class MenuTrigger {}

// Both on one element — Angular de-duplicates AtomId and AtomHover
// <button tooltipTrigger menuTrigger>Open</button>
```

## What This Unlocks: Atoms

With de-duplication, directive composition becomes practical. Terse UI introduces **atoms** — single-responsibility host directives that each handle exactly one concern:

| Atom | Responsibility |
| --- | --- |
| `AtomId` | Generates and applies a unique `id` attribute |
| `AtomHover` | Tracks pointer hover state |
| `AtomAnchor` | Sets a CSS anchor name for anchor positioning |
| `AtomAnchored` | Positions an element relative to an anchor |

Atoms are small. `AtomId` is 28 lines. They do one thing, they do it well, and they compose freely because Angular handles the de-duplication.

## Protos: Atoms Composed

**Protos** are headless UI components that compose atoms via `hostDirectives`:

```ts
@Directive({
  selector: '[protoButton]',
  hostDirectives: [AtomId, AtomHover],
  // ...
})
export class ProtoButton { /* keyboard, ARIA, disabled states */ }
```

Protos provide complete behavior and accessibility with zero CSS. They follow WAI-ARIA patterns, handle keyboard navigation, and expose `data-*` attributes for styling. You bring the design.

## Before and After

| | Before (Angular &lt;22) | After (Angular 22+) |
| --- | --- | --- |
| **Shared atoms** | `NG0309` error | Automatic de-duplication |
| **Workaround** | `AutoHost` decorator with `WeakMap` | None needed |
| **Composition** | Manual, fragile | Declare in `hostDirectives` |
| **API surface** | Verbose wrapper classes | Terse — atoms just stack |
