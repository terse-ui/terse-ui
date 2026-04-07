# Classes

Merge class values from multiple sources using a composable reducer pattern.

## Why use this atom?

- Replaces spartan-ng's 300-line `classes()` function (global `MutationObserver` with `subtree: true`, `WeakMap` tracking, source ordering, SSR transition suppression) with ~60 lines
- Multiple directives and components can contribute classes to the same element without conflicts
- Pluggable reducer function for custom merging strategies (e.g. `tailwind-merge`)
- No global observers, no mutation tracking, no DOM polling

## Import

```ts
import {AtomClass, provideAtomClassOpts} from '@terse-ui/atoms/classes';
```

## Usage

Set a base class on any element:

```html
<button atomClass="px-4 py-2 rounded">Base styles</button>
```

### Registering Class Sources

Host directives and parent components register additional class sources via `register()`. Each registered function receives the current base value and returns a merged result:

```ts
@Directive({
  selector: '[myVariant]',
  hostDirectives: [AtomClass],
})
export class MyVariant {
  readonly #atomClass = inject(AtomClass);

  constructor() {
    // Register a class source; returns an unregister function
    this.#atomClass.register((base) => `${base} bg-blue-500 text-white`);
  }
}
```

### Custom Reducer (Tailwind Merge)

By default, classes are concatenated. For Tailwind projects where class conflicts need resolution, provide a custom reducer:

```ts
import {twMerge} from 'tailwind-merge';

@Component({
  providers: [provideAtomClassOpts({reducer: twMerge})],
})
export class AppComponent {}
```

With this configuration, conflicting Tailwind classes are resolved intelligently:

```html
<!-- With twMerge reducer: "py-2 rounded bg-red-500" wins over "bg-blue-500" -->
<button atomClass="px-4 py-2 rounded bg-blue-500" myVariant>
  Red button (variant overrides base)
</button>
```

### As a Host Directive

```ts
@Component({
  selector: 'my-button',
  hostDirectives: [{directive: AtomClass, inputs: ['atomClass']}],
  template: `<ng-content />`,
})
export class MyButton {
  readonly #atomClass = inject(AtomClass);

  constructor() {
    this.#atomClass.register((base) => `${base} inline-flex items-center`);
  }
}
```

## API Reference

### AtomClass

| | |
| --- | --- |
| **Selector** | `[atomClass]` |
| **Exported as** | `atomClass` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `atomClass` | `T` | — | The base class value passed to the reducer chain |

#### Methods

| Method | Signature | Description |
| --- | --- | --- |
| `register` | `(fn: (base: T) => T) => () => void` | Add a class source to the reducer chain. Returns an unregister function. |

### provideAtomClassOpts

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `reducer` | `(a: T, b: T) => T` | String concatenation | Custom merge function for resolving class conflicts |
