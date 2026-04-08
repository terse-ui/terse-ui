# Focus Trap

Trap keyboard focus within the host element via Tab wrapping.

## Why use this atom?

- Essential for modal dialogs, popovers, and dropdown menus
- Tab on the last focusable element wraps to the first, Shift+Tab on the first wraps to the last
- Auto-focuses the first tabbable element on init
- Redirects external focus attempts back inside the trap
- Handles removed elements via MutationObserver
- No CDK dependency — uses standard tabbable element detection

## Import

```ts
import {AtomFocusTrap} from '@terse-ui/atoms/focus-trap';
```

## Usage

```html
<div atomFocusTrap>
  <input placeholder="First" />
  <button>Action</button>
  <input placeholder="Last" />
</div>
```

When active, Tab on the last input wraps focus to the first input. Shift+Tab on the first input wraps to the last button.

### Disabling

```html
<div atomFocusTrap [atomFocusTrapDisabled]="!isOpen()">
  ...
</div>
```

### Disabling auto-focus

```html
<div atomFocusTrap [atomFocusTrapAutoFocus]="false">
  ...
</div>
```

### As a host directive

```ts
@Component({
  selector: 'my-dialog',
  hostDirectives: [
    AtomFocusTrap,
    AtomEscapeKey,
    AtomClickOutside,
  ],
  template: `<ng-content />`,
})
export class MyDialog {}
```

This is the composition story — a dialog composes focus trap, escape key, and click outside. Angular 22 de-duplicates if any of these atoms appear in other directives on the same element.

## Tabbable element detection

The directive queries for standard tabbable elements:

- `a[href]`
- `button:not([disabled])`
- `input:not([disabled]):not([type="hidden"])`
- `select:not([disabled])`
- `textarea:not([disabled])`
- `[tabindex]:not([tabindex="-1"])`
- `[contenteditable]`

Elements are further filtered by visibility (`display: none` and `visibility: hidden` are excluded).

## External focus redirection

A document-level `focusin` listener detects when focus moves outside the trap and redirects it to the first tabbable element inside. This prevents focus from escaping via programmatic focus changes or assistive technology.

## Mutation handling

A `MutationObserver` watches the container for removed child elements. If the currently focused element is removed from the DOM, focus is redirected to the first tabbable element (or the container itself as fallback).

## API Reference

<!-- api-ref:atoms/focus-trap -->
