# Id

Generate and apply a unique, stable ID to any element.

## Why use this atom?

- Automatic unique IDs without manual tracking or counters
- Deterministic prefix-based generation (`atom-1`, `atom-2`, ...)
- Essential for `aria-labelledby`, `aria-describedby`, and `for`/`id` associations
- Composes into protos and custom directives as a host directive

## Import

```ts
import {AtomId} from '@terse-ui/atoms';
```

## Usage

```html
<div atomId>Hello</div>
<!-- Renders: <div id="atom-1">Hello</div> -->
```

Each element gets a unique ID. The prefix `atom-` is followed by an auto-incrementing number scoped to the `IdGenerator` instance.

## As a Host Directive

`AtomId` is designed to compose. Use it in `hostDirectives` to give any directive or component an automatic ID:

```ts
@Directive({
  selector: '[myTrigger]',
  hostDirectives: [AtomId],
})
export class MyTrigger {
  readonly #id = inject(AtomId);

  // Access the generated ID value
  get triggerId() {
    return this.#id.value; // "atom-3"
  }
}
```

## API Reference

### AtomId

| | |
| --- | --- |
| **Selector** | `[atomId]` |
| **Host bindings** | `[id]` bound to `value` |

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string` (readonly) | The generated ID, e.g. `"atom-1"` |
