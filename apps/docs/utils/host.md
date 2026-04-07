# Host

Utilities for working with host element attributes and per-element singleton services.

## AutoHost

```ts
import {AutoHost} from '@terse-ui/core/utils/host';
```

`AutoHost` is a class decorator that ensures one instance of a service per host element. It uses a `WeakMap` keyed by host element and overrides Angular's `__NG_ELEMENT_ID__` to return the cached instance.

### Usage

```ts
@AutoHost()
export class MyPerElementService {
  // One instance per host element, regardless of how many
  // directives on that element inject this service.
}
```

### The Story

`AutoHost` was originally built as a workaround before Angular 22's host directive de-duplication. When multiple directives on the same element each declared a shared host directive, Angular threw `NG0309`. `AutoHost` solved this by manually de-duplicating at the service level — one instance per host element, no matter how many directives request it.

With Angular 22, host directives are de-duplicated automatically. But `AutoHost` turned out to have genuine use-cases beyond the workaround.

### Why Not Just Use Host Directives?

Take `HostAttributes`. You *could* slap a `@Directive` decorator on it, add it to `hostDirectives`, and Angular 22 would de-duplicate it just fine. Functionally, it would work like `inject(HostAttributes, {host: true})`.

But there's a safety problem. If a consumer forgets to include it in their `hostDirectives` array, `inject()` walks up the injector tree and silently resolves a *parent* host's attributes instead of the current element's. The directive would read the wrong element's `role`, `type`, or `tabindex` — a subtle, hard-to-debug mistake.

`AutoHost` prevents this entirely. It keys instances to the host element via `WeakMap`, so `inject(HostAttributes)` always returns the instance for the *current* host element, regardless of what the consumer remembers to declare. No accidental parent resolution, no footgun.

**Rule of thumb:** use host directives for composable behavior (atoms). Use `AutoHost` for per-element services where getting the wrong element's data would be a silent error.

## HostAttributes

```ts
import {HostAttributes} from '@terse-ui/core/utils/host';
```

`HostAttributes` reads static HTML attributes from the host element at directive construction time. It uses Angular's `HostAttributeToken` under the hood, with results cached per attribute key.

### Usage

```ts
@Directive({
  selector: '[myDirective]',
})
export class MyDirective {
  readonly #attrs = inject(HostAttributes);

  constructor() {
    const role = this.#attrs.get('role');     // reads host's role attribute
    const type = this.#attrs.get('type');     // reads host's type attribute
  }
}
```

`HostAttributes` is decorated with `@AutoHost()`, ensuring one instance per host element even when multiple directives inject it. This is used internally by `ProtoButton` to read initial `role`, `type`, and `tabindex` values from the host element.
