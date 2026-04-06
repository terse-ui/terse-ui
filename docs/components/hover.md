# Hover

Tracks pointer hover state. Handles pointer events, mouse events, and ignores touch-emulated mouse events.

## Install

```bash
pnpm add @terse-ui/core
```

## Import

```typescript
import { BaseHover } from '@terse-ui/core/hover';
```

## Usage

```angular-html
<button baseHover>Hover me</button>
```

Sets `data-hover` on the host when hovered. Style it:

```css
[data-hover] {
  background-color: var(--hover-bg);
}
```

## Disabled

```angular-html
<button baseHover [baseHoverDisabled]="true">Can't hover</button>
```

Resets hover state if already hovered when disabled.

## API

### Inputs

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `baseHoverDisabled` | `boolean` | `false` | Disables hover tracking |

### Outputs

| Name | Type | Description |
| --- | --- | --- |
| `baseHoverStart` | `void` | Hover begins |
| `baseHoverEnd` | `void` | Hover ends |
| `baseHoverChange` | `boolean` | Hover state changed |

### Properties

| Name | Type | Description |
| --- | --- | --- |
| `isHovered()` | `Signal<boolean>` | Current hover state |

### Data Attributes

| Attribute | When |
| --- | --- |
| `data-hover` | Element is hovered |

## Accessibility

Distinguishes pointer from touch input. No sticky hover states on mobile. Hover-dependent UI (tooltips, dropdowns) only appears with pointer input.
