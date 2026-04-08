# Visibility

Track whether the host element is visible in the viewport using the Intersection Observer API.

## Why use this atom?

- Reactive `isVisible` and `ratio` signals powered by signality's `elementVisibility()`
- Exposes `data-visible` and `data-hidden` attributes for CSS-only styling
- Configurable threshold and root margin
- SSR-safe with automatic cleanup
- No manual IntersectionObserver boilerplate

## Import

```ts
import {AtomVisibility} from '@terse-ui/atoms/visibility';
```

## Usage

```html
<img atomVisibility (atomVisibility)="loadImage()">
```

When the element enters the viewport, `data-visible` is set and `data-hidden` is removed. When it leaves, the reverse happens.

### Lazy loading

```html
<div atomVisibility #vis="atomVisibility">
  @if (vis.isVisible()) {
    <heavy-component />
  }
</div>
```

### Scroll-triggered animations

```css
[atomVisibility][data-visible] {
  animation: fadeIn 0.3s ease-out;
}

[atomVisibility][data-hidden] {
  opacity: 0;
}
```

### Threshold and root margin

```html
<!-- Trigger when 50% visible -->
<div atomVisibility [atomVisibilityThreshold]="0.5">...</div>

<!-- Expand detection area by 100px -->
<div atomVisibility atomVisibilityRootMargin="100px">...</div>
```

### As a host directive

```ts
@Directive({
  selector: '[lazyLoad]',
  hostDirectives: [AtomVisibility],
})
export class LazyLoad {
  readonly #vis = inject(AtomVisibility);
  readonly shouldLoad = computed(() => this.#vis.isVisible());
}
```

## API Reference

<!-- api-ref:atoms/visibility -->
