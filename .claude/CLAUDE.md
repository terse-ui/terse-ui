You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Signality

This project heavily uses [`@signality/core`](https://signality.dev) as its reactive building block layer. Always prefer signality utilities over raw browser APIs or custom implementations.

**Required usage:**
- `listener()` from `@signality/core` — for all event listeners. Never use raw `addEventListener`/`removeEventListener`. The `listener` utility handles SSR safety, `untracked()` execution (prevents NG0600), and effect-based cleanup. Supports chainable modifiers: `listener.capture.passive(...)`.
- `onClickOutside()` from `@signality/core` — for click-outside detection. Uses `composedPath()` for Shadow DOM compatibility and pointer-down/pointer-up sequence.
- `activeElement()` from `@signality/core` — reactive signal tracking the document's active element.
- `mutationObserver()` from `@signality/core` — reactive MutationObserver wrapper with automatic cleanup.

**Import path:** Always import from `@signality/core` (not deeper paths like `@signality/core/browser/listener`).

## Project Architecture

Terse UI is a headless Angular UI library with a three-layer architecture:

- **`@terse-ui/core`** (`packages/core`) — Foundational utilities: `IdGenerator`, `optsBuilder`, deep-merge, type guards, injection helpers, `AutoHost`, `HostAttributes`.
- **`@terse-ui/atoms`** (`packages/atoms`) — Atomic host directives. Single-responsibility behavioral primitives (`AtomId`, `AtomHover`, `AtomAnchor`, `AtomAnchored`) that compose freely via Angular 22's de-duplicated host directives.
- **`@terse-ui/protos`** (`packages/protos`) — Headless UI components composed from atoms via `hostDirectives`. Zero CSS, full WAI-ARIA compliance. (`ProtoButton`, more coming.)

Other directories:

- `apps/docs` — VitePress documentation site.
- `apps/examples` — Angular Elements used as live demos in docs.

The key innovation is Angular 22's host directive de-duplication (no more NG0309). Before this, composing multiple host directives that shared a common atom was impractical. The `AutoHost` decorator (`@terse-ui/core/utils/host`) was the workaround and is still used internally.

## Documentation Conventions

Follow the structure established in `apps/docs/protos/button.md` as the gold standard:

1. **H1** with the component/directive name
2. **One-line description** sentence
3. **"Why use this?"** section with bullet points
4. **Import** snippet (always use secondary entry points: `@terse-ui/protos/button`, not `@terse-ui/protos`)
5. **Accessibility features** table (where applicable, linking WAI-ARIA patterns)
6. **Examples** using `<Example name="..." />` (only when a corresponding Angular Element exists in `apps/examples/`)
7. **Styling** section with CSS selector examples
8. **API Reference** using `<!-- api-ref:atoms/hover -->` (or the relevant path). This marker is replaced at build time by the `api-ref-inject` VitePress plugin (`apps/docs/.vitepress/plugins/api-ref-inject.ts`) which renders tables from extracted JSON in `apps/docs/.vitepress/data/api/`. Never write API tables manually.
9. **Keyboard Interactions** with `<kbd>` tags (where applicable)

Tone: technical but approachable. No fluff, no emoji. Aim for ~100 lines per page. Use tables for structured comparisons. Reference WAI-ARIA patterns where applicable.

## VitePress Conventions

- Docs live in `apps/docs/`, config at `apps/docs/.vitepress/config.mts`.
- Live examples are Angular components registered as custom elements with the `ex-` prefix, embedded in docs with `<Example name="proto-button-loading" />`.
- The `Example.vue` component loads `public/examples/browser/main.js` and renders the Angular custom element.
- Only add `<Example>` embeds when a corresponding Angular Element exists in `apps/examples/`.
