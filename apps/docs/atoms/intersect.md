# Intersect

Observe element visibility with `IntersectionObserver`, exposing intersection state as a signal and data attribute.

## Why use this atom?

- Declarative `IntersectionObserver` without manual setup or teardown
- `data-intersecting` attribute for CSS-only visibility styling
- `isIntersecting` signal for programmatic access
- Configurable threshold and root margin
- Foundation for lazy loading, infinite scroll, and analytics visibility tracking

## Import

```ts
import {AtomIntersect} from '@terse-ui/atoms/intersect';
```

## Usage

```html
<img
  atomIntersect
  (atomIntersect)="onVisible($event)"
  src="placeholder.jpg"
/>
```

When the element enters the viewport, `data-intersecting` is set and the output emits an `IntersectionObserverEntry`.

### Template Reference

```html
<div atomIntersect #intersect="atomIntersect">
  {{ intersect.isIntersecting() ? 'Visible' : 'Hidden' }}
</div>
```

### Lazy Loading

```html
<div atomIntersect #intersect="atomIntersect" [atomIntersectRootMargin]="'200px'">
  @if (intersect.isIntersecting()) {
    <img src="heavy-image.jpg" alt="Lazy loaded" />
  }
</div>
```

### Custom Threshold

```html
<div
  atomIntersect
  [atomIntersectThreshold]="0.5"
  (atomIntersect)="onHalfVisible($event)"
>
  Fires when 50% visible
</div>
```

### Disabling

```html
<div atomIntersect [atomIntersectDisabled]="true">
  Observer is paused
</div>
```

## API Reference

### AtomIntersect

| | |
| --- | --- |
| **Selector** | `[atomIntersect]` |
| **Exported as** | `atomIntersect` |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `atomIntersectDisabled` | `boolean` | `false` | Pause the intersection observer |
| `atomIntersectThreshold` | `number` | `0` | Visibility ratio (0 to 1) that triggers the observer |
| `atomIntersectRootMargin` | `string` | `'0px'` | Margin around the root for early/late triggering |

#### Outputs

| Output | Type | Description |
| --- | --- | --- |
| `atomIntersect` | `IntersectionObserverEntry` | Emitted on each intersection change |

#### Properties

| Property | Type | Description |
| --- | --- | --- |
| `isIntersecting` | `Signal<boolean>` (readonly) | Whether the element is currently intersecting |

#### Data Attributes

| Attribute | Description |
| --- | --- |
| `data-intersecting` | Present when the element is intersecting. Absent otherwise. |
