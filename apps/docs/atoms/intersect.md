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

<!-- api-ref:atoms/intersect -->
