# Classes

Compose CSS classes from multiple sources on a single element using Angular's reactive primitives.

## Why use this atom?

Angular's `[class]` binding works for simple cases, but breaks down when multiple directives need to contribute classes to the same host element. `AtomClasses` solves this:

- **Multi-source composition** — directives and components register class sources via `pre()` and `post()` without conflicts
- **Reactive** — class sources are functions evaluated inside a `computed()`, so signal changes automatically update the DOM
- **Pluggable merge strategy** — default uses `clsx` for concatenation; swap in `tailwind-merge` or any custom resolver
- **SSR-safe** — suppresses CSS transitions during hydration to prevent visual flicker
- **No global observers** — pure Angular signals, no `MutationObserver`, no DOM polling

## Import

```ts
import {AtomClasses, provideAtomClassesOpts} from '@terse-ui/atoms/classes';
```

`AtomClass` is a convenience alias that maps the input to `class` instead of `atomClasses`:

```ts
import {AtomClass} from '@terse-ui/atoms/classes';
```

## Usage

### Basic

```html
<button atomClasses="px-4 py-2 rounded">Styled button</button>
```

### Registering class sources

Directives that compose `AtomClasses` as a host directive can inject it and register additional class sources. Sources registered with `pre()` are applied before the base `class` input; `post()` sources are applied after.

```ts
@Directive({
  selector: '[myVariant]',
  hostDirectives: [AtomClasses],
})
export class MyVariant {
  readonly #classes = inject(AtomClasses);

  readonly variant = input<'primary' | 'secondary'>('primary');

  constructor() {
    this.#classes.pre(() =>
      this.variant() === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800',
    );
  }
}
```

Later `pre()` registrations take higher precedence. Use `post()` only when you need to override the consumer's `class` input.

### Unregistering sources

Both `pre()` and `post()` return an unregister function:

```ts
const unregister = this.#classes.pre(() => 'temporary-class');

// Later, remove the source
unregister();
```

### As a host directive

```ts
@Component({
  selector: 'my-button',
  hostDirectives: [{directive: AtomClasses, inputs: ['atomClasses']}],
  template: `<ng-content />`,
})
export class MyButton {
  readonly #classes = inject(AtomClasses);

  constructor() {
    this.#classes.pre(() => 'inline-flex items-center justify-center');
  }
}
```

Consumers pass classes through the input, which are merged with the component's own sources:

```html
<my-button atomClasses="mt-4">Save</my-button>
<!-- Result: "inline-flex items-center justify-center mt-4" -->
```

## Tailwind CSS integration

By default, `AtomClasses` uses `clsx` to concatenate classes. This means conflicting Tailwind utilities like `p-2` and `p-4` both end up in the DOM.

For Tailwind projects, provide `tailwind-merge` at the application root:

```ts
import {provideAtomClassesOpts} from '@terse-ui/atoms/classes';
import {clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

bootstrapApplication(AppComponent, {
  providers: [
    provideAtomClassesOpts({
      mapResult: (result) => twMerge(clsx(result)),
    }),
  ],
});
```

With this configuration, later sources intelligently override conflicting utilities:

```html
<!-- pre() registers "bg-blue-500", consumer passes "bg-red-500" -->
<!-- Result with twMerge: "bg-red-500" (consumer wins) -->
<my-button atomClasses="bg-red-500">Override</my-button>
```

## Merge order

Classes are merged in this order, where later entries take higher precedence:

| Position | Source                        | Registered via      |
| -------- | ----------------------------- | ------------------- |
| 1        | Pre sources (earliest first)  | `pre()`             |
| 2        | Base class input              | `atomClasses` input |
| 3        | Post sources (earliest first) | `post()`            |

With the default `clsx` merge, all classes are concatenated. With `tailwind-merge`, conflicting utilities resolve in favor of later entries.

## Styling

```css
[atomClasses] {
  /* Target elements using the directive */
}
```

## API Reference

<!-- api-ref:atoms/classes -->
